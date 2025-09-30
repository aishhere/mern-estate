import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { 
  updateUserStart, 
  updateUserSuccess, 
  updateUserFailure, 
  deleteUserFailure, 
  deleteUserStart, 
  deleteUserSuccess, 
  signOutUserStart 
} from "../redux/user/userSlice";
import { Link } from "react-router-dom";
import Listing from "../../../api/models/listing.model";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(null);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarPreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }, [file]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());

      // 1️⃣ Upload avatar first if selected
      let avatarUrl = currentUser.avatar;

      if (file) {
        const uploadData = new FormData();
        uploadData.append("avatar", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();

        if (!uploadJson.success) {
          setFileUploadError(true);
          dispatch(updateUserFailure(uploadJson.message));
          return;
        }

        avatarUrl = uploadJson.fileUrl;
      }

      // 2️⃣ Update user with JSON (no file)
      const payload = {
        username: formData.username || currentUser.username,
        email: formData.email || currentUser.email,
        password: formData.password || "",
        avatar: avatarUrl,
      };

      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      setFileUploadError(false);
    } catch (err) {
      dispatch(updateUserFailure(err.message));
      setFileUploadError(true);
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch("/api/auth/signOut");
      const data = await res.json();
      if (!data.success) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.successn === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if(data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) => 
        prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.log(error.message);
    }
  }
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatarPreview || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        <p className="text-sm self-center">
          {fileUploadError && (
            <span className="text-red-700">
              Error uploading image (must be less than 2MB)
            </span>
          )}
        </p>

        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          defaultValue={currentUser.email}
          id="email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
        <Link
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to={"/create-listing"}
        >
          Create Listing
        </Link>
      </form>

      <div className="flex justify-between mt-5">
        <span onClick={handleDeleteUser} className="text-red-700 cursor-pointer">
          Delete account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign out
        </span>
      </div>

      <p className="text-red-700 mt-5">{error}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess && "User is updated successfully!"}
      </p>

      <button onClick={handleShowListings} 
      className="text-green-700 w-full mt-5">
        Show Listings
      </button>
      <p className="text-red-700 mt-2">
        {showListingsError ? "Error showing listings" : ''}
      </p>

      {userListings && 
      userListings.length > 0 && 
      <div className="flex flex-col gap-4">
        <h1 className="text-center mt-7 text-2xl font-semibold">Your Listings</h1>
      {userListings.map((listing) => (
       <div key={listing._id} 
       className="border rounded-lg p-3 flex justify-between items-center gap-4">
        <Link to={`/listings/${listing._id}`}>
       {listing.imageUrls && listing.imageUrls.length > 0 ? (
      <img
      src={
      listing.imageUrls[0].startsWith("http")
        ? listing.imageUrls[0]
        : `http://localhost:3000${listing.imageUrls[0]}`
      }
      alt="listing cover"
      className="w-16 h-16 object-contain "
      />
     ) :  (
     <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-lg">
     <span className="text-gray-500 text-sm">No Image</span>
     </div>
     )}
     </Link>
     <Link 
     className='text-slate-700 font-semibold flex-1 hover:underline truncate '
     to={`/listing/${listing._id}`}
     >
     <p>{listing.name}</p>
     </Link>

     <div className="flex flex-col items-center">
      <button onClick={()=>handleListingDelete(listing._id)} 
      className="text-red-700 uppercase">Delete</button>
      <Link to={`/update-listing/${listing._id}`}>
      <button className="text-green-700 uppercase">Edit</button>
      </Link>

     </div>

       </div> 
      ))}
      </div>}
    </div>
  );
}
