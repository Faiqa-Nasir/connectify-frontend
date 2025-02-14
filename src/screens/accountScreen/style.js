import { StyleSheet } from "react-native";
import ColorPallete from '../../constants/ColorPallete'

export default styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPallete.bg,
        padding: 24,
        paddingTop: 52,
        paddingBottom: 0
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,

        marginVertical: -8,
        marginLeft: -8,
        borderWidth: 0
    },
    backButton: {
        padding: 8,
        borderWidth: 0,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    optionItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: ColorPallete.main_black_2,
    },
    optionTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        color: ColorPallete.text_black,
    },
    arrow: {
        marginLeft: 10,
        fontSize: 16,
        color: ColorPallete.text_black,
    },
    dropdownContent: {
        paddingLeft: 16,
        paddingVertical: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    dropdownText: {
        fontSize: 14,
        color: ColorPallete.text_black,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        backgroundColor: ColorPallete.main_black_2,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    logoutIcon: {
        marginRight: 12,
    },
    logoutText: {
        fontSize: 18,
        color: ColorPallete.pop_up_white,
    }
})