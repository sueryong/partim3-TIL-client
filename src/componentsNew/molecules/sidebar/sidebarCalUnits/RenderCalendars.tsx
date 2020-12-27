import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CalCheckBox, CalSettingButton, CalDeleteButton } from './';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../modules';
import {
  handleCheckedCalStart,
  handleCheckedCalSuccess_add,
  handleCheckedCalSuccess_del,
  handleCheckedCalFailure,
} from '../../../../modules/handleCheckedCal';

interface RenderCalendarsProps {
  calendars: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  delCalendar: (calId: number) => void;
  isMyCalendar: boolean;
}

export default function RenderCalendars({
  calendars,
  delCalendar,
  isMyCalendar,
}: RenderCalendarsProps) {
  const { checkedCalArray } = useSelector((state: RootState) => state.handleCheckedCal);

  const dispatch = useDispatch();

  const handleCheckBox = (checkedCal: number, isChecked: boolean) => {
    if (checkedCalArray.indexOf(checkedCal) === -1 && isChecked === true) {
      dispatch(handleCheckedCalStart());
      dispatch(handleCheckedCalSuccess_add(checkedCal));
    } else {
      dispatch(handleCheckedCalStart());
      dispatch(handleCheckedCalSuccess_del(checkedCalArray.indexOf(checkedCal)));
    }
  };

  let eachCalendars;

  if (calendars === []) {
    eachCalendars = '';
  } else {
    eachCalendars = calendars.map(eachCalendar => {
      const [mouseOver, setMouseOver] = useState(false);

      return (
        <RenderCalendarsWrap
          key={eachCalendar.id}
          onMouseOver={() => setMouseOver(true)}
          onMouseOut={() => setMouseOver(false)}
        >
          <CalCheckBox
            eachCalendarId={eachCalendar.id}
            eachCalendarColor={eachCalendar.color}
            eachCalendarName={eachCalendar.name}
            calArrayForFiltering={checkedCalArray}
            handleCheckBox={handleCheckBox}
          />
          <CalSettingButton eachCalendarName={eachCalendar.name} mouseOver={mouseOver} />
          {!isMyCalendar ? (
            ''
          ) : (
            <CalDeleteButton
              calId={eachCalendar.id}
              calName={eachCalendar.name}
              delCalendar={delCalendar!}
              mouseOver={mouseOver}
            />
          )}
        </RenderCalendarsWrap>
      );
    });
  }

  return <>{eachCalendars}</>;
}

const RenderCalendarsWrap = styled.div`
  margin-left: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: white;
  justify-content: center;
  &:hover {
    background-color: white;
    color: black;
    border-radius: 2px;
  }
`;
