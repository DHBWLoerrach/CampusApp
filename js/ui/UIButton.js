import React from 'react';
import {Text, Pressable} from 'react-native';
import Styles from '../Styles/StyleSheet';

//Commented code is TypeScript supported
/*interface ButtonProps {
    children: any;
    size?: string,
        disabled?: boolean,
        onClick: Event
}*/

const UIButton = (props/*: ButtonProps*/) => {
    let size = Styles.button.sizes[props?.size ?? "medium"];
    let textSize = Styles.textSizes[props?.size ?? "medium"];

    return (
        <Pressable style={[Styles.button.container, size, props.disabled ? Styles.button.disabled : ""]}
                   onPress={() => props.onClick()}
                   disabled={props.disabled}>
            <Text style={[Styles.button.text, textSize]}>{props.children}</Text>
        </Pressable>

    );
}

export default UIButton;
