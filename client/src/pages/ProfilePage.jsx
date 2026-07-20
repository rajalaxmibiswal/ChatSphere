import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext);

  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || "");
      setBio(authUser.bio || "");
    }
  }, [authUser]);

  // Convert image to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result);

      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const profileData = {
        fullName: name,
        bio,
      };

      if (selectedImg) {
        const base64Image = await convertToBase64(selectedImg);
        profileData.profilePic = base64Image;
      }

      const success = await updateProfile(profileData);

      if (success) {
        navigate("/");
      }
    } catch (error) {
      console.error("Profile Update Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div
        className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300
        border-2 border-gray-600 flex items-center justify-between
        max-sm:flex-col-reverse rounded-lg"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-xl font-medium">Profile Details</h3>

          <label
            htmlFor="avatar"
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="file"
              id="avatar"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files[0];

                if (file) {
                  setSelectedImg(file);
                }
              }}
            />

            <img
              src={
                selectedImg
                  ? URL.createObjectURL(selectedImg)
                  : authUser?.profilePic || assets.avatar_icon
              }
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />

            Upload Profile Image
          </label>

          <input
            type="text"
            required
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border border-gray-500 rounded-md
            focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <textarea
            rows={4}
            required
            placeholder="Write Profile Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="p-2 border border-gray-500 rounded-md
            focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600
            text-white p-2 rounded-full text-lg cursor-pointer"
          >
            Save
          </button>
        </form>

        <img
          className={`max-w-44 aspect-square rounded-full
          mx-10 max-sm:mt-10 & {selectedImg && 'rounded-full}`} src={ authUser?.profilePic || assets.logo_icon}
          alt="Logo"
        />
      </div>
    </div>
  );
};

export default ProfilePage;