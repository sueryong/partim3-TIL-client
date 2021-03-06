import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../modules';
import Review from '../molecules/reviews/Review';
import BigModal from '../atoms/BigModal';
import getToday from '../../componentsNew/utils/todayF';
import styled from 'styled-components';
import { BiPen } from 'react-icons/bi';
import REACT_APP_URL from '../../config';
import {
  getCalendarsStart,
  getCalendarsSuccess,
  getCalendarsFailure,
} from '../../modules/getAllCalendars';

import axios from 'axios';

type reviewType = {
  calendarColor: string;
  calendarId: number;
  context: string;

  id: number;
  imageUrl: string | null;
  reviewTags: Array<{
    tag: {
      description: string;
      id: number;
      tagColor: string;
      tagName: string;
    };
  }>;
  scheduleDate: { year: number; month: number; day: number };
  scheduleTime: { hour: number; min: number };
  title: string;
  totalTime: number;
};

interface ReviewsProps {
  setNewPosted: (newPosted: boolean) => void;
}

export default function Reviews({ setNewPosted }: ReviewsProps) {
  const { reviews, todos } = useSelector((state: RootState) => state.calendarDay.todosAndReviews);
  const { currentUser } = useSelector((state: RootState) => state.loginOut.status);
  const { checkedCalArray } = useSelector((state: RootState) => state.handleCheckedCal);
  const { today } = useSelector((state: RootState) => state.handleToday);

  console.log({ todos });
  const dispatch = useDispatch();

  const [modalShow, setModalShow] = useState(false);
  const [currentHour, setCurrentHour] = useState(getToday().hour);
  const [currentMin, setCurrentMin] = useState(getToday().min);

  const handleDel = (reviewId: number, calendarId: number) => {
    return axios
      .delete(`${REACT_APP_URL}/calendar/review`, {
        data: {
          userId: currentUser,
          reviewId,
          calendarId,
        },
        withCredentials: true,
      })
      .then(res => {
        getUpdatedCal();
      })
      .catch(err => {
        console.log({ err });
      });
  };

  const handleUpdate = (
    reviewId: number,
    calendarId: number,
    scheduleDate: string,
    scheduleTime: string,
    title: string,
    context: string,
    imageUrl: string,
    tags: number[],
  ) => {
    if (title === '' || context === '') {
      alert('제목 또는 내용이 입력되지 않았습니다.');
      return;
    }

    return axios
      .put(
        `${REACT_APP_URL}/calendar/review`,
        {
          userId: currentUser, // required
          reviewId, // required
          title,
          context,
          imageUrl,
          scheduleDate,
          scheduleTime: scheduleTime, // required
          calendarId, // required
          tags,
        },
        {
          withCredentials: true,
        },
      )
      .then(res => {
        getUpdatedCal();
      })
      .catch(err => {
        console.log({ err });
      });
  };

  const getUpdatedCal = () => {
    let TodayForAxios = {
      year: getToday().year,
      month: getToday().month,
      day: getToday().day,
    };
    return axios
      .get(`${REACT_APP_URL}/calendar/day`, {
        params: { userId: currentUser, date: TodayForAxios },
        withCredentials: true,
      })
      .then(async res => {
        let { myCalendars, shareCalendars } = res.data;
        await dispatch(getCalendarsSuccess(myCalendars, shareCalendars));
        await setNewPosted(true);
      })
      .catch(err => console.log(err));
  };

  let reviewList;

  if (reviews === []) {
    reviewList = '';
  } else {
    let addTotalTime = reviews.map((el: reviewType) => {
      let date = el.scheduleDate;
      let time = el.scheduleTime;
      let total = date.year + '/' + date.month + '/' + date.day + ' ' + time.hour + ':' + time.min;
      let parseTime = Date.parse(total);
      el.totalTime = parseTime;
      return el;
    });

    let sortedList = addTotalTime.sort(function (a, b) {
      return parseFloat(String(a.totalTime)) - parseFloat(String(b.totalTime));
    });

    reviewList = sortedList.map((el: reviewType) => {
      if (checkedCalArray.indexOf(el.calendarId) !== -1) {
        const {
          id,
          title,
          context,
          imageUrl,
          scheduleDate,
          scheduleTime,
          calendarId,
          reviewTags,
        } = el;

        let defaultArrayOfTagsId: number[] = [];

        if (el.reviewTags[0].tag === null) {
          defaultArrayOfTagsId = [];
        } else {
          for (let j = 0; j < el.reviewTags.length; j++) {
            defaultArrayOfTagsId.push(el.reviewTags[j].tag.id);
          }
        }

        return (
          <Review
            key={id}
            id={id}
            title={title}
            context={context}
            imageUrl={imageUrl}
            scheduleDate={scheduleDate}
            scheduleTime={scheduleTime}
            calendarId={calendarId}
            reviewTags={reviewTags}
            defaultArrayOfTagsId={defaultArrayOfTagsId}
            handleDel={handleDel}
            handleUpdate={handleUpdate}
          ></Review>
        );
      }
    });
  }

  useEffect(() => {
    let currentTime = getToday();
    setCurrentHour(currentTime.hour);
    setCurrentMin(currentTime.min);
  }, [modalShow]);

  return (
    <Box>
      <ReviewContainer>
        <TitleAndBtn>
          <ReviewTitle>
            TIL-오늘 하루종일 무얼했나?{'  '}
            <AddReviewBtn
              onClick={() => {
                setCurrentHour(getToday().hour);
                setCurrentMin(getToday().min);
                setModalShow(true);
              }}
            >
              기록하기 <BiPen></BiPen>
            </AddReviewBtn>
          </ReviewTitle>
        </TitleAndBtn>
        <ReviwList>{reviewList}</ReviwList>
        <BigModal
          show={modalShow}
          onHide={() => setModalShow(false)}
          setNewPosted={setNewPosted}
          currentHour={currentHour}
          currentMin={currentMin}
          today={today}
        ></BigModal>
      </ReviewContainer>
    </Box>
  );
}
// margin-left: 10px;

const Box = styled.div`
  padding-top: 10px;
  border-top: 1px solid #dadce0;
`;

const ReviewContainer = styled.div`
  margin-left: 10px;
  margin-right: 10px;
`;

const TitleAndBtn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ReviewTitle = styled.div`
  flex: 1;
`;

const AddReviewBtn = styled.button`
  width: 100px;
  height: 35px;
  font-size: 15px;
  outline: none;
  border: 0px;
  border-bottom: 1px solid #dadce0;
  color: #3c4043;
  background-color: white;
  border-radius: 2px;
  &:hover {
    outline: none;
    background-color: #f0f2f1;
    color: black;
  }
`;

const ReviwList = styled.div`
  margin-top: 3px;
  margin-bottom: 3px;
  height: 570px;
  /* overflow: auto; */
  // 리뷰 좌측의 timeline과 리뷰 글 자체가 따로 놀아서, 일단 이 속성을 해제함
`;
// render review get요청으로 받아와서, 화면에 리뷰들을 뿌려주는 부분을 구현해야함.
// molecules로 review를 구현
// post review 비어있는 부분을 만들어서 공란을 선택시에 해당 함수가 동작하도록 해야하고, 값을 어떻게 받아올지도 고민해야함.

// sendReview는 어떤 인자값을 받지않는 함수여야 함.
// axios에 리턴이 있으면 Promise<void>, 없으면 그냥 void인데 차이가 뭔지 모르겠음.
