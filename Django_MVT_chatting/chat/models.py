from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver

from eat_together_chatting.json_extended import ExtendedJSONEncoder, ExtendedJSONDecoder


class OnlineUserMixin(models.Model):
    class Meta:
        abstract = True

    def get_online_users(self):
        return self.online_user_set.all()

    def get_online_usernames(self):
        qs = self.get_online_users().values_list("username", flat=True)
        return list(qs)

    def is_joined_user(self, user):
        return self.get_online_users().filter(pk=user.pk).exists()

    def user_join(self, channel_name, user):
        try:
            room_member = OpenRoomMember.objects.get(room=self, user=user)
        except OpenRoomMember.DoesNotExist:
            room_member = OpenRoomMember(room=self, user=user)

        is_new_join = len(room_member.channel_names) == 0
        room_member.channel_names.add(channel_name)

        if room_member.pk is None:
            room_member.save()
        else:
            room_member.save(update_fields=["channel_names"])

        return is_new_join

    def user_leave(self, channel_name, user):
        try:
            room_member = OpenRoomMember.objects.get(room=self, user=user)
        except OpenRoomMember.DoesNotExist:
            return True

        room_member.channel_names.remove(channel_name)
        if not room_member.channel_names:
            room_member.delete()
            return True
        else:
            room_member.save(update_fields=["channel_names"])
            return False


class OpenRoom(OnlineUserMixin, models.Model):
    online_user_set = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="OpenRoomMember",
        blank=True,
        related_name="joined_room_set",
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_room_set",
    )

    name = models.CharField(max_length=100)

    class Meta:
        ordering = ["-pk"]

    @property
    def chat_group_name(self):
        return self.make_chat_group_name(room=self)

    @staticmethod
    def make_chat_group_name(room=None, room_pk=None):
        return "chat-%s" % (room_pk or room.pk)


class MatchingRoom(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        ordering = ["-pk"]

    @property
    def chat_group_name(self):
        return self.make_chat_group_name(room=self)

    @staticmethod
    def make_chat_group_name(room=None, room_pk=None):
        return "chat-%s" % (room_pk or room.pk)


    mathing_room_user_set = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="MatchingRoomMember",
        blank=True,
        related_name="matching_room_set",
    )

    def register_user_in_room(self, user):
        room_member = MatchingRoomMember(room=self, user=user)

        if room_member.room and room_member.user:
            room_member.save()
        else:
            raise ValueError("room 또는 member가 존재하지 않습니다.")
    def exit_room(self, user):
        room_member = MatchingRoomMember.objects.get(room=self, user=user)
        room_member.delete()


class OpenRoomMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(OpenRoom, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)


class MatchingRoomMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(MatchingRoom, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

@receiver(post_delete, sender=OpenRoom, dispatch_uid="room__on_post_delete")
def open_room__on_post_delete(instance: OpenRoom, **kwargs):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        instance.chat_group_name,
        {
            "type": "chat.room.deleted",
        }
    )


class OpenRoomMember(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    room = models.ForeignKey(OpenRoom, on_delete=models.CASCADE)
    channel_names = models.JSONField(default=set, encoder=ExtendedJSONEncoder, decoder=ExtendedJSONDecoder)


class MatchingRoomMember(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    room = models.ForeignKey(MatchingRoom, on_delete=models.CASCADE)
    channel_names = models.JSONField(default=set, encoder=ExtendedJSONEncoder, decoder=ExtendedJSONDecoder)

@receiver(post_delete, sender=MatchingRoomMember, dispatch_uid="matching_room_member__on_post_delete")
def matching_room_member__on_post_delete(sender, instance, **kwargs):
    channel_layer = get_channel_layer()

    if instance.room:
        room_members = MatchingRoomMember.objects.filter(room=instance.room).exclude(user=instance.user)
        for member in room_members:
            async_to_sync(channel_layer.group_send)(
                member.room.chat_group_name,
                {
                    "type": "matching_chat_user_exit",
                    "username": instance.user.username,
                }
            )