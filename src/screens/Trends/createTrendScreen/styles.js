import { StyleSheet, Dimensions, Platform } from "react-native"
import ColorPalette from "../../../constants/ColorPalette"

const { width, height } = Dimensions.get("window")

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00111A",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cancelText: {
    color: ColorPalette.gradient_text,
    fontSize: 16,
  },
  startButton: {
    backgroundColor: ColorPalette.gradient_text,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  startText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    minHeight: 50,
    paddingTop: 0,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 0.5,
    borderColor: "rgba(26, 193, 202, 0.3)",
    backgroundColor: "#00111A",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBarWithKeyboard: {
    position: "relative",
  },
  locationText: {
    color: ColorPalette.gradient_text,
    fontSize: 14,
    marginTop: 10,
    position: "absolute",
    bottom: Platform.OS === "ios" ? 90 : 56,
    left: 16,
  },
  locationTextWithKeyboard: {
    position: "relative",
    bottom: 0,
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 17, 26, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#001824",
    padding: 20,
    borderRadius: 12,
    width: width - 64,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  modalButtonYes: {
    backgroundColor: ColorPalette.gradient_text,
  },
  modalButtonNo: {
    borderWidth: 1,
    borderColor: ColorPalette.gradient_text,
  },
  modalButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
})

