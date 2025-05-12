import {
  Link,
  redirect,
  useActionData,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import styles from "./AuthPage.module.css";
import AuthForm from "../../Components/Auth/Auth";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsLogged } from "../../store/authSlice";
export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const isLogin = searchParams.get("mode") === "login";
  const isLogged = useSelector((state) => state.auth.isLogged);
  const data = useActionData();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    if (isLogged) navigate("/");
    if (data && data.success) dispatch(setIsLogged(true));
  });

  return (
    <div className={styles.AuthPage}>
      <div className={styles.authContainer}>
        <div className={styles.auth}>
          <header className={styles.header}>
            <h1>Enter your info to Log In</h1>
            <h2>
              {isLogin
                ? "Still do not have an account?"
                : "Already have an account?"}{" "}
              <Link to={isLogin ? "/auth?mode=signup" : "/auth?mode=login"}>
                {isLogin ? "Sign Up" : "Log In"}
              </Link>
            </h2>
          </header>
          <AuthForm isLogin={isLogin} />
          {data && !data.success && (
            <div className={styles.problems}>
              <h1>{data.message}</h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const api_base_url = "http://localhost:3000";

export async function action({ request }) {
  const searchParams = new URL(request.url).searchParams;
  const fd = await request.formData();
  let data;
  const isLogin = searchParams.get("mode") === "login";
  if (isLogin) {
    data = {
      email: fd.get("email"),
      password: fd.get("password"),
    };
  } else {
    data = {
      email: fd.get("email"),
      password: fd.get("password"),
      username: fd.get("username"),
      confirmPassword: fd.get("confirmPassword"),
    };
  }
  let url = `${api_base_url}/api/`;

  const response = await fetch(`${url}${isLogin ? "login" : "registration"}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
  });

  if (response.status === 400) {
    return {
      success: false,
      message: await response.json(),
    };
  }
  if (response.status === 401) {
    return {
      success: false,
      message: await response.json(),
    };
  }
  if (response.status === 404) {
    return {
      success: false,
      message: await response.json(),
    };
  }
  if (response.status === 409) {
    return { success: false, message: await response.json() };
  }

  const responseData = await response.json();
  localStorage.setItem("accessToken", responseData);
  return { success: true, token: responseData };
}
