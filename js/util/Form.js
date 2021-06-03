import React, { Component } from 'react';
import {
    StyleSheet,
    Platform,
    TouchableOpacity,
    TouchableNativeFeedback,
    View, Text, Button
} from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
export default class Form extends Component {

    state = { fields: this.props.fields };

    validateAll(fields) {
        let hasProblems = false;
        Object.entries(fields).forEach(([k, e]) => {
            e.validated = true;
            if (this.validateInput(e))
                hasProblems = true;
        });
        return hasProblems;
    }

    validateInput(field) {

        if (field.validated && field.required && (!field.value || field.value.trim() === "")) {
            return <Text style={styles.errText}>{field.name + " "}darf nicht leer sein</Text>;
        }

        return null;

    }

    render() {

        const fields = this.state.fields;
        return (
            <View>
                <ScrollView style={styles.container}>
                    {
                        Object.entries(fields).map(([key, field], i) => {
                            return (
                                <View key={i}>
                                    <Text>{field.name}:</Text>
                                    <TextInput style={styles.input}
                                        onChangeText={(input) => {
                                            const newField = field;
                                            newField.value = input;
                                            newField.validated = true;
                                            this.setState(this.state.fields[key] = newField);
                                        }}
                                        value={field.value}>
                                    </TextInput>
                                    { this.validateInput(field)}
                                </View>);
                        })
                    }
                </ScrollView>
                {this.props.btnLabel ? <Button color="red" title={this.props.btnLabel}
                    onPress={() => {

                        if (this.validateAll(this.state.fields)) {
                            this.forceUpdate();
                            return;
                        }
                        this.props.btnFunc(this.state.fields);
                    }
                    }></Button> : null}
            </View>

        );
    }
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        height: 35,
        marginBottom: 8
    },
    errText: {
        color: "red"
    },
    container: {
        flexGrow: 1,
        marginBottom: 4
    }

});