package SWST.eat_together.post.model;

import SWST.eat_together.post.Post;
import lombok.Data;
import org.springframework.beans.BeanUtils;

@Data
public class PostDetailDTO extends Post {
    private boolean isAuthor;
    private String email;
    private String nickname;

    public PostDetailDTO(Post post, String currentUserEmail) {
        this.isAuthor = post.getUser().getEmail().equals(currentUserEmail);
        BeanUtils.copyProperties(post, this);
        this.email = post.getUser().getEmail();
        this.nickname = post.getUser().getNickname();
    }

    public PostDetailDTO(Post post) {
        this.email = post.getUser().getEmail();
        this.nickname = post.getUser().getNickname();
        BeanUtils.copyProperties(post, this, "user");
    }
}
