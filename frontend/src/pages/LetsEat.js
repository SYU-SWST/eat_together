import { useNavigate } from 'react-router-dom';
import MyButton from '../components/MyButton';
import MyHeader from '../components/MyHeader';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import MyContext from '../components/MyContext';
import Map from '../components/Map';

const LetsEat = () => {
  const navigate = useNavigate();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const { people, gender, age, menu, conversation, startTime, setStartTime, latitude, longitude, handleLocation } =
    useContext(MyContext);

  useEffect(() => {
    let isMounted = true;
    const source = axios.CancelToken.source();

    axios
      .get('/users/validate', { cancelToken: source.token })
      .then((res) => {
        if (isMounted && res.status !== 404) {
        }
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          return;
        }
        alert('같이 먹자 페이지는 로그인 후 사용하실 수 있습니다.');
        navigate('/SignIn');
      });

    return () => {
      isMounted = false;
      source.cancel('Request canceled');
    };
  }, [navigate]);

  const handleStartTime = (event) => {
    setStartTime(event.target.value);
  };

  const handleSelectFilter = () => {
    navigate('/FilterDetail');
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      const options = { enableHighAccuracy: true };

      const successCallback = (position) => {
        const { latitude, longitude } = position.coords;
        const accuracy = position.coords.accuracy;
        if (accuracy > 100) {
          setLocationError(true);
        }
        handleLocation(latitude, longitude);
        setMapLoaded(true);
      };

      const errorCallback = (error) => {
        setLocationError(true);
      };

      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options);
    } else {
      setLocationError(true);
    }
  };

  useEffect(() => {
    if (!startTime) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = hours + ':' + minutes;
      setStartTime(currentTime);
    }
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const toKorean = (value) => {
    switch (value) {
      case 'any':
        return '상관없음';
      case '2':
        return '2인';
      case '3':
        return '3인';
      case '4':
        return '4인';
      case 'same':
        return '동성만';
      case 'peer':
        return '또래만';
      case 'Korean':
        return '한식';
      case 'Chinese':
        return '중식';
      case 'Japanese':
        return '일식';
      case 'Western':
        return '양식';
      case 'Vietnamese':
        return '베트남식';
      case 'Bunsik':
        return '분식';
      case 'Dessert':
        return '디저트';
      case 'Little':
        return '적음';
      case 'Normal':
        return '보통';
      case 'Many':
        return '많음';
      default:
        return '';
    }
  };

  return (
    <div>
      <MyHeader
        headText={'같이 먹자'}
        leftChild={
          <MyButton
            text={'뒤로가기'}
            onClick={() => {
              navigate('/');
            }}
          />
        }
      />
      <div className="flex flex-col items-center pt-5">
        <div className="flex flex-row flex-wrap border-4 border-project rounded-xl w-5/6 flex-shrink-0">
          <div className="flex flex-col justify-center items-center m-auto">
            <p className="flex font-bold text-3xl pt-3 pb-3">모임 날짜</p>
            <input
              className="flex text-center text-xl w-full text-red-500 font-semibold"
              type="text"
              placeholder="닉네임"
              value={new Date()
                .toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  weekday: 'short',
                })
                .replace(/\./g, ' /')}
              readOnly
            />
            <p className=" text-gray-500 pb-3">※모임 날짜는 당일로 고정됩니다.</p>
          </div>
          <div className="flex flex-col justify-center items-center m-auto w-64 flex-shrink-0">
            <p className="font-bold text-3xl pt-3 pb-3">시간 선택</p>
            <input
              className=" text-xl text-red-500 font-semibold"
              type="time"
              value={startTime}
              onChange={handleStartTime}
            />
            <p className=" text-gray-500 pt-2 pb-3">※시간 변경이 가능합니다.</p>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center m-auto border-4 border-project rounded-xl w-5/6 mt-5">
          <p className="font-bold text-3xl pt-3 pb-1">필터 선택</p>
          <p className="pt-3 text-xl font-semibold pb-2">현재 선택한 필터</p>
          <div className="text-xl pb-3">
            <p>
              <span className="font-bold">인원: </span>
              <span className=" text-red-500 font-semibold">{toKorean(people)}</span>
            </p>
            <p>
              <span className="font-bold">성별: </span>
              <span className=" text-red-500 font-semibold">{toKorean(gender)}</span>
            </p>
            <p>
              <span className="font-bold">나이: </span>
              <span className=" text-red-500 font-semibold">{toKorean(age)}</span>
            </p>
            <p>
              <span className="font-bold">메뉴: </span>
              <span className=" text-red-500 font-semibold">{toKorean(menu)}</span>
            </p>
            <p>
              <span className="font-bold">대화: </span>
              <span className=" text-red-500 font-semibold">{toKorean(conversation)}</span>
            </p>
            <div className="mt-2 text-center">
              <MyButton text={'선택하기'} onClick={handleSelectFilter} />
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center border-4 border-project rounded-xl w-5/6 mt-5 mb-5">
          <p className="font-bold text-3xl pt-3 pb-3">매칭 위치</p>
          <p className=" text-gray-500 pt-1 pb-1 px-2 text-center">
            ※대략적인 현재 위치 기준으로 <br /> 근처 인원이 매칭됩니다 :)
          </p>
          {latitude && longitude ? (
            <div className="w-full p-4 text-center">
              {mapLoaded ? (
                <div>
                  <Map center={{ latitude, longitude }} />
                  <p className={locationError ? 'text-red-500 m-2' : ''}>
                    {locationError ? '위치가 정확하지 않을 수 있습니다. 지도를 이동하여 마커를 수정해주세요.' : ''}
                  </p>
                </div>
              ) : (
                <p className=" text-center">지도를 로딩 중입니다...</p>
              )}
            </div>
          ) : (
            <p className={locationError ? 'text-red-500' : ''}>
              {locationError ? '위치 정보를 가져오는 중 오류가 발생했습니다.' : '위치 정보를 가져오는 중...'}
            </p>
          )}
          <div className="mb-2">
            <MyButton
              text={'매칭 시작'}
              onClick={() => {
                alert('매칭 시작!!');
                navigate('/Matching');
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetsEat;
