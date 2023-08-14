package SWST.eat_together.domain.member;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class MemberService {

    private MemberRepository memberRepository ;

    @Autowired
    public void setMemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;}

    public String saveUser(SignUpDTO form) {
        if (memberRepository.existsByEmail(form.getEmail())) {
            return "email";
        }

        if (memberRepository.existsByNickname(form.getNickname())) {
            return "nickname";
        }

        String DjangoApiUrl = "http://127.0.0.1:8000/accounts/signup/";
        signUpRequest(DjangoApiUrl, form.getNickname(), form.getEmail(), form.getPassword());


        Member member = new Member();
        member.setEmail(form.getEmail());
        member.setName(form.getName());
        member.setNickname(form.getNickname());
        member.setDate(form.getBirthDate());
        member.setPassword(form.getPassword());
        member.setGender(form.getGender());

        memberRepository.save(member);

        return "0";
    }
    public Member login(LoginDTO form){
        Member member = new Member();
        member = memberRepository.findByEmail(form.getEmail());
        if (member == null) {
            // 오류
            System.out.println("회원정보 없음");
            return null;
        }

        if (member.getPassword().equals(form.getPassword()))
            return member;

        return null;
    }

    public static void signUpRequest(String apiUrl, String nickname, String email, String password) {
        String jsonBody = String.format("{\"nickname\":\"%s\",\"email\":\"%s\",\"password\":\"%s\"}", nickname, email, password);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> requestEntity = new HttpEntity<>(jsonBody, headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, requestEntity, String.class);
        HttpStatus statusCode = response.getStatusCode();
        String responseBody = response.getBody();

        System.out.println("Response Status Code: " + statusCode);
        System.out.println("Response Body: " + responseBody);
    }

    public int getAgeFromNickname(String nickname) {
        Member member = memberRepository.findByNickname(nickname);
        if (member != null && member.getDate() != null) {
            LocalDate birthDate = member.getDate().toLocalDate();
            LocalDate currentDate = LocalDate.now();
            return Period.between(birthDate, currentDate).getYears();
        }
        return -1; // Return a placeholder value or handle this case accordingly
    }
}