import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import RoundedContainer from "../../components/RoundedContainer";
import { AntDesign } from "@expo/vector-icons";
import VerificationCode from "../../../assets/svgs/VerificationCode";
import CustomButton from "../../components/CustomButton";

export default function CodeVerificationScreen({ navigation, route }) {
    const { email } = route.params ? route.params : { email: "bsef21m009@pucit.edu.pk" };
    const [code, setCode] = useState(["", "", "", ""]);
    const inputRefs = useRef([]);

    const handleVerifyCode = () => {
        // Handle code verification logic here
        console.log("Code verified : ", code.join(""));
        // alert("Code Entered : " + code.join(""));
        navigation.navigate("SuccessScreen");
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleHelp = () => {
        // Handle help logic here
    };

    const handleChangeText = (text, index) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);
        if (text && index < 3) {
            inputRefs.current[index + 1].focus();
        } else if (!text && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    return (
        <View style={styles.container}>
            <RoundedContainer>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30, marginTop: 20 }}>
                    <AntDesign name="arrowleft" size={24} color={ColorPalette.green} onPress={handleGoBack} />
                    <Text style={styles.helpText} onPress={handleHelp}>Help</Text>
                </View>
                <Text style={styles.title}>Code Verification</Text>
                <VerificationCode style={styles.verificationCodeSvg} height="150" width="150" />

                <Text style={styles.subtitle}>
                    Please enter the verification code sent to <Text style={styles.emailText}>{email}</Text>
                </Text>
                <View style={styles.codeContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => inputRefs.current[index] = ref}
                            style={[styles.codeInput, digit && styles.codeInputFocused]}
                            value={digit}
                            onChangeText={(text) => handleChangeText(text, index)}
                            keyboardType="numeric"
                            maxLength={1}
                        />
                    ))}
                </View>
                <CustomButton title="Verify Code" onPress={handleVerifyCode} />
                <TouchableOpacity>
                    <Text style={styles.codeText}>Did not recieve the code?  <Text style={styles.codeLink}>Resend Code</Text></Text>
                </TouchableOpacity>
            </RoundedContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: ColorPalette.green,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
        textAlign: "center",
    },
    codeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    codeInput: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        textAlign: "center",
        fontSize: 18,
        borderWidth: 1,
        borderColor: ColorPalette.green,
    },
    codeInputFocused: {
        borderWidth: 2,
    },
    input: {
        width: "100%",
        padding: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 16,
    },
    button: {
        width: "100%",
        padding: 12,
        backgroundColor: "#007BFF",
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    helpText: {
        fontSize: 14,
        color: ColorPalette.green,
        fontFamily: 'CG-Regular',
    },
    verificationCodeSvg: {
        alignSelf: 'center',
        marginBottom: 10,

    },
    codeText: {
        fontSize: 14,
        marginTop: 20,
        color: ColorPalette.text_black,
        fontFamily: 'CG-Regular',
        textAlign: 'center',
        paddingBottom: 20,
      },
      codeLink: {
        fontSize: 14,
        marginTop: 20,
        color: ColorPalette.green,
        fontFamily: 'CG-Semibold',
      },
    emailText: {
        fontWeight: "bold",
        color: ColorPalette.green,
    },
});
