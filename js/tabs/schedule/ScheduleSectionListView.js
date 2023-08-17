import { useCallback, useContext, useRef, useState } from 'react';
import { SectionList, View } from 'react-native';
import {
  useFocusEffect,
  useScrollToTop,
} from '@react-navigation/native';
import DayHeader from './DayHeader';
import SearchBar from '../../util/SearchBar';
import LectureRow from './LectureRow';
import Styles from '../../Styles/StyleSheet';
import { ColorSchemeContext } from '../../context/ColorSchemeContext';
import { LecturesContext } from '../../context/LecturesContext';

export default function ScheduleSectionListView() {
  const [searchString, setSearchString] = useState('');
  const colorContext = useContext(ColorSchemeContext);
  const { lectureSections, loadData, isLoading } =
    useContext(LecturesContext);
  const listRef = useRef(null);

  // when screen is focussed empty search bar
  useFocusEffect(
    useCallback(() => {
      setSearchString('');
    }, [])
  );

  useScrollToTop(listRef); // scroll to top when tab is selected

  function filterLectures(searchString, rawLectures) {
    if (searchString.length === 0 || !rawLectures) {
      return rawLectures || [];
    }
    const filteredData = rawLectures
      .map((item) => {
        // Filter the inner data array which contains the lectures
        const filteredInnerData = item.data.filter((innerItem) =>
          innerItem.title
            ?.toLowerCase()
            .includes(searchString.toLowerCase())
        );

        if (filteredInnerData.length) {
          return {
            title: item.title,
            data: filteredInnerData,
          };
        }

        return null;
      })
      .filter((item) => item !== null); // Filter out the null values

    return filteredData;
  }

  return (
    <View
      style={[
        Styles.ScheduleScreen.container,
        { backgroundColor: colorContext.colorScheme.background },
      ]}
    >
      <SearchBar
        onSearch={(text) => setSearchString(text)}
        searchString={searchString}
      />
      <SectionList
        ref={listRef}
        sections={filterLectures(searchString, lectureSections)}
        renderItem={({ item }) => <LectureRow lecture={item} />}
        renderSectionHeader={({ section }) => (
          <DayHeader title={section.title} />
        )}
        onRefresh={loadData}
        refreshing={isLoading}
      />
    </View>
  );
}
