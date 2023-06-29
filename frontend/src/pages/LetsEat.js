import { useNavigate } from "react-router-dom";
import MyButton from "../components/MyButton";
import MyHeader from "../components/MyHeader";
import { useEffect, useState } from "react";
import axios from "axios";

const LetsEat = () => {
  const navigate = useNavigate();
  const [editTime, setEditTime] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [people, setPeople] = useState();
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [menu, setMenu] = useState([]);
  const [conversation, setConversation] = useState("");
  const [filterSelection, setFilterSelection] = useState(null);

  const handleStartTime = (event) => {
    setStartTime(event.target.value);
  };

  const handleEndTime = (event) => {
    setEndTime(event.target.value);
  };

  const handlePeople = (event) => {
    setPeople(event.target.value);
  };

  const handleGender = (event) => {
    setGender(event.target.value);
  };

  const handleAge = (event) => {
    setAge(event.target.value);
  };

  const handleMenu = (event) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setMenu(selectedOptions);
  };

  const handleConversation = (event) => {
    setConversation(event.target.value);
  };

  const handleSaveFilters = (filters) => {
    setPeople(filters.people);
    setGender(filters.gender);
    setAge(filters.age);
    setMenu(filters.menu);
  };

  const handleMatching = () => {
    alert("mathcing start!!");
    console.log("Selected Filters:", {
      people,
      gender,
      age,
      menu,
      conversation,
    });
  };

  useEffect(() => {
    axios
      .get("/users/validate")
      .then((res) => {
        if (res.status === 404) {
          alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
          navigate("/SignIn");
        }
      })
      .catch((err) => {
        console.log("로그인이 되어있습니다.");
      });
  });

  useEffect(() => {
    axios
      .get("")
      .then((res) => {
        //이전에 선택했었던 항목 받아서 집어넣는 코드
      })
      .catch((err) => {
        alert("기존 선택항목을 불러오는데 오류가 발생했습니다.");
        console.log(err);
      });
  });

  const handleFilterSelection = (event) => {
    if (event.target.value === "myFilter") {
      const filterSelectionContent = (
        <div>
          <p>인원: {people}</p>
          <p>성별: {gender}</p>
          <p>나이대: {age}</p>
          <p>메뉴: {menu.join(", ")}</p>
          <p>대화 정도: {conversation}</p>
        </div>
      );

      setFilterSelection(filterSelectionContent);
    } else if (event.target.value === "selectFilter") {
      navigate("/FilterDetail", {
        state: { handleSaveFilters: handleSaveFilters },
      });
    }
  };

  return (
    <div>
      <MyHeader
        headText={"같이 먹자"}
        leftChild={
          <MyButton
            text={"뒤로가기"}
            onClick={() => {
              navigate("/");
            }}
          />
        }
      />
      <h3>모임 날짜</h3>
      <div>
        <input
          type="text"
          placeholder="닉네임"
          value={new Date()
            .toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              weekday: "short",
            })
            .replace(/\./g, " /")}
          readOnly
        />

        <h3>시간 선택</h3>
        <label>
          시작 시간:
          <input type="time" value={startTime} onChange={handleStartTime} />
        </label>
        <label>
          종료 시간:
          <input type="time" value={endTime} onChange={handleEndTime} />
        </label>
      </div>

      <h3>필터 선택</h3>
      <div>
        <input
          type="radio"
          name="filter"
          value="myFilter"
          checked={true}
          onChange={handleFilterSelection}
        />
        나의 필터
        <input
          type="radio"
          name="filter"
          value="selectFilter"
          onChange={handleFilterSelection}
        />
        필터 선택
      </div>
      <div id="filterSelectionDiv">{filterSelection}</div>
    </div>
  );
};

export default LetsEat;
