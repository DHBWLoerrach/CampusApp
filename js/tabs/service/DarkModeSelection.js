import {View, StyleSheet, Text, Switch} from "react-native";
import React, {useState} from "react";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import Styles from "../../Styles/StyleSheet";
import Colors from '../../util/Colors';

export default function DarkModeSelection() {
    const [darkMode, setDarkMode] = useState(false);
    const [override, setOverride] = useState(false);

    return (
        <View>
            <View style={style.itemRow}>
                <BouncyCheckbox
                    fillColor={Colors.dhbwRed}
                    unfillColor="#FFFFFF"
                    text="Systemeinstellung ignorieren"
                    onPress={(isChecked) => {setOverride(isChecked)}}
                    isChecked={override}
                    size={20}
                    textStyle={{fontSize: 14}}/>
            </View>
            {
                override && (
                    <View style={[style.itemRow, style.switchRow]}>
                        <Text>
                            Dark Mode
                        </Text>
                        <Switch trackColor={{false: Colors.dhbwGray, true: Colors.dhbwRed}}
                                thumbColor="#f4f3f4"
                                onValueChange={(value) => setDarkMode(value)}
                                value={darkMode}/>
                    </View>
                )
            }
        </View>
    );
}

const style = StyleSheet.create({
    container: {
        flex: 1
    },
    itemRow: {
        flexDirection: "row",
        marginTop: 10
    },
    switchRow: {
        justifyContent: "space-between"
    }
});