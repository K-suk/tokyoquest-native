import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { userAtom } from "../atoms/user";

GoogleSignin.configure({
  // google-services.json または GoogleService-Info.plist の同一プロジェクト内 Web クライアントID
  webClientId:
    "457610781381-4mo0ui0t9j55k2b9cprsfhc468jt4hvm.apps.googleusercontent.com",
  iosClientId:
    "457610781381-og1g7p5eooeatpgddlgt9h8ha5502shc.apps.googleusercontent.com",
});

export function useFirebaseAuth() {
  const [user, setUser] = useAtom(userAtom);

  const register = async (email: string, password: string) => {
    try {
      await auth().createUserWithEmailAndPassword(email, password);
    } catch (e) {
      console.error(e);
    }
  };

  const signInWithEmailAndPassword = async (
    email: string,
    password: string
  ) => {
    try {
      const { user } = await auth().signInWithEmailAndPassword(email, password);
      setUser(user);
    } catch (e) {
      console.error(e);
    }
  };

  const signinWithGoogle = async () => {
    try {
      const userInfo = await GoogleSignin.signIn();

      // 最新バージョンでは signIn() 後に getTokens() を呼ぶと確実に ID トークンを取得できる
      let idToken = (userInfo as { idToken?: string | null }).idToken;
      if (!idToken) {
        try {
          const tokens = await GoogleSignin.getTokens();
          idToken = tokens?.idToken;
        } catch (tokenError) {
          console.error("Failed to fetch Google tokens", tokenError);
        }
      }

      if (!idToken) {
        console.error("Google sign in error: idToken is missing");
        return;
      }

      // IDトークンでサインインする
      const authCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(authCredential);
      setUser(userCredential.user);
    } catch (e) {
      throw new Error("Firebase google login error: " + JSON.stringify(e));
    }
  };

  const signOut = async () => {
    try {
      await auth().signOut();
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  // 初回レンダリング時にログイン状態監視のイベントハンドラーを登録
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => setUser(user));
    return subscriber;
  }, []);

  return {
    user,
    register,
    signinWithGoogle,
    signInWithEmailAndPassword,
    signOut,
  };
}
