import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import gql from "graphql-tag";
import { useQuery, useMutation } from "react-apollo-hooks";
import withSuspense from "./withSuspense";

const GET_MESSAGES = gql`
  query messages {
    messages {
      id
      text
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation sendMessage($text: String!) {
    sendMessage(text: $text) {
      id
      text
    }
  }
`;

function Chat() {
  const [message, setMessage] = useState("");
  const [sendMessageMutation] = useMutation(SEND_MESSAGE, {
    variables: {
      text: message,
    },
    refetchQueries: () => [{ query: GET_MESSAGES }],
  });
  const { data, error } = useQuery(GET_MESSAGES, { suspend: true });
  const onChangeText = (text) => setMessage(text);
  const onSubmit = async () => {
    if (message === "") {
      return;
    }
    try {
      await sendMessageMutation();
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };
  console.log(data);
  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingVertical: 50,
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {data.messages.map((m) => (
          <View key={m.id} style={{ marginBottom: 10 }}>
            <Text>{m.text}</Text>
          </View>
        ))}
        <TextInput
          placeholder="Type a message"
          style={{
            marginTop: 50,
            width: "90%",
            paddingVertical: 15,
            paddingHorizontal: 10,
            backgroundColor: "#f2f2f2",
          }}
          returnKeyType="send"
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default withSuspense(Chat);
