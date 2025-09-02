import { StyleSheet } from "react-native";
import ColorPallete from '../../constants/ColorPallete'

export default styles=StyleSheet.create({
    uploadBtn:{
        backgroundColor:ColorPallete.pop_up_white,
        alignItems:'center',
        justifyContent:'center',

        // iOS Shadow properties
        shadowColor: "rgba(250, 172, 252, 0.4)",
        shadowOffset: {
        width: 0,
        height: 0,
        },
        shadowOpacity: 1,
        shadowRadius: 16,
        
        elevation:4
    },
    uploadBtnTitle:{
        fontSize:20,
        fontFamily:'CG-Medium',
        fontWeight:'500',
        color:ColorPallete.text_light,
        position:'absolute',
        top:'75%'
    },
    uploadBtnContainer:{
        marginTop:'6%',
        alignItems:'center',
        justifyContent:'center',
    }
})