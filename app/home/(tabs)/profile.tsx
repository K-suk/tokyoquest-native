import { StyleSheet, Text, View } from "react-native";

export default function Profile() {
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
    });

    return (
        <View style={styles.container}>
            <Text>Profile</Text>
        </View>
    );
}
