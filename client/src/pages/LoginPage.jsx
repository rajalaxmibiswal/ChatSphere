import React, { useContext, useState } from 'react'
import assets from '../assets/assets'
import { AuthContext } from "../../context/AuthContext"
 
import { useNavigate } from "react-router-dom";
const LoginPage = () => {

  const [currState, setCurrState] = useState("Sign up")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [isDataSubmitted, setIsDataSubmitted] = useState(false)
  const navigate = useNavigate();
  const { login } = useContext(AuthContext)

  const onSubmitHandler = async (e) => {

  e.preventDefault();

  if (currState === "Sign up" && !isDataSubmitted) {
    setIsDataSubmitted(true);
    return;
  }

  const success = await login(
    currState === "Sign up" ? "signup" : "login",
    {
      fullName,
      email,
      password,
      bio,
    }
  );

  if (success && currState === "Login") {
    navigate("/");
  }
};

  return (

    <div
      className='min-h-screen
      bg-cover
      bg-center
      flex
      items-center
      justify-center
      gap-8
      sm:justify-evenly
      max-sm:flex-col
      backdrop-blur-2xl'
    >

      {/* Left Side */}

      <img
        src={assets.logo_big}
        alt=""
        className='w-[min(30vw,250px)]'
      />

      {/* Right Side */}

      <form
        onSubmit={onSubmitHandler}
        className='border-2
        bg-white/10
        border-gray-500
        text-white
        p-6
        flex
        flex-col
        gap-5
        rounded-lg
        shadow-lg
        min-w-[320px]'
      >

        {/* Heading */}

        <h2
          className='font-medium
          text-2xl
          flex
          justify-between
          items-center'
        >

          {currState}

          {
            currState === "Sign up" &&
            isDataSubmitted &&
            <img
              src={assets.arrow_icon}
              alt=""
              className='w-5 cursor-pointer'
              onClick={() => setIsDataSubmitted(false)}
            />
          }

        </h2>

        {/* Full Name */}

        {
          currState === "Sign up" &&
          !isDataSubmitted &&
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className='p-2
            border
            border-gray-500
            rounded-md
            bg-transparent
            focus:outline-none
            focus:ring-2
            focus:ring-violet-500'
          />
        }

        {/* Email + Password */}

        {
          !isDataSubmitted &&
          <>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='p-2
              border
              border-gray-500
              rounded-md
              bg-transparent
              focus:outline-none
              focus:ring-2
              focus:ring-violet-500'
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className='p-2
              border
              border-gray-500
              rounded-md
              bg-transparent
              focus:outline-none
              focus:ring-2
              focus:ring-violet-500'
            />
          </>
        }

        {/* Bio */}

        {
          currState === "Sign up" &&
          isDataSubmitted &&
          <textarea
            rows="4"
            placeholder='Provide a short bio...'
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            className='p-2
            border
            border-gray-500
            rounded-md
            bg-transparent
            focus:outline-none
            focus:ring-2
            focus:ring-violet-500'
          />
        }

        {/* Button */}

        <button
          type='submit'
          className='py-3
          bg-gradient-to-r
          from-purple-500
          to-violet-700
          rounded-md
          cursor-pointer
          font-medium'
        >

          {
            currState === "Sign up"
              ? isDataSubmitted
                ? "Create Account"
                : "Next"
              : "Login Now"
          }

        </button>

        {/* Terms */}

        <div
          className='flex
          items-center
          gap-2
          text-sm
          text-gray-300'
        >

          <input type="checkbox" required />

          <p>
            Agree to the terms of use & privacy policy
          </p>

        </div>

        {/* Toggle Login / Signup */}

        <div
          className='text-center
          text-sm
          text-gray-300'
        >

          {
            currState === "Sign up"

              ?

              <p>

                Already have an account?

                <span
                  onClick={() => {
                    setCurrState("Login")
                    setIsDataSubmitted(false)
                  }}
                  className='text-violet-400
                  cursor-pointer
                  ml-1'
                >

                  Login

                </span>

              </p>

              :

              <p>

                Don't have an account?

                <span
                  onClick={() => {
                    setCurrState("Sign up")
                    setIsDataSubmitted(false)
                  }}
                  className='text-violet-400
                  cursor-pointer
                  ml-1'
                >

                  Sign Up

                </span>

              </p>
          }

        </div>

      </form>

    </div>
  )
}

export default LoginPage