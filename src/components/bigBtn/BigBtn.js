import { Text, Dimensions, TouchableOpacity, View } from "react-native";
import React from "react";
// import DropShadow from "react-native-drop-shadow";
import styles from "./style";
import UploadArrow from "../../../assets/svg/UploadArrow";
import MicRecorder from "../../../assets/svg/MicRecorder";

const deviceDimensions = {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  };

export default function BigBtn(props) {
  return (
    // <DropShadow
    //   style={{
    //     shadowColor: "rgba(250, 172, 252, 0.4)",
    //     shadowOffset: {
    //       width: 0,
    //       height: 0,
    //     },
    //     shadowOpacity: 1,
    //     shadowRadius: 16,
    //   }}
    // >
      <TouchableOpacity
        onPress={props.onPress}
        style={[
          styles.uploadBtn,
          {
            borderRadius: 1500,
            width: (deviceDimensions.width / 100) * 69,
            height: (deviceDimensions.height / 100) * 33,
          },
        ]}
      >
        {
            props.mode === 'Upload' &&
            <UploadArrow
            width={(deviceDimensions.width / 100) * 30}
            height={(deviceDimensions.height / 100) * 16}
            />
        }
        {
            (props.mode === 'Start' || props.mode === 'Pause' || props.mode==='Finish') &&
            <MicRecorder
            width={(deviceDimensions.width / 100) * 30}
            height={(deviceDimensions.height / 100) * 20}
            />
        }
        <Text style={styles.uploadBtnTitle}>{props.title}</Text>
      </TouchableOpacity>
    // </DropShadow>
  );
}
