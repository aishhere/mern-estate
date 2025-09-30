import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 5000,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);


useEffect(() => {
  const fetchListing = async () => {
    try {
      const listingId = params.listingId;
      const res = await fetch(`/api/listing/get/${listingId}`);
      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        return;
      }

      // If backend returns { listing: { ... } }
      const listingData = data.listing ? data.listing : data;

      // Merge into defaults to avoid undefined values
      setFormData((prev) => ({
        ...prev,
        ...listingData,
      }));
    } catch (err) {
      console.error("Error fetching listing:", err);
    }
  };

  fetchListing();
}, [params.listingId]);



  // Handle file selection and previews
  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 6);
    setFiles(selectedFiles);
    setPreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  // Remove selected file
  const handleRemoveFile = (index) => {
    const updatedFiles = [...files];
    const updatedPreviews = [...previews];
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };


  // Remove an existing uploaded image
  const handleRemoveExistingImage = (index) => {
    setFormData((prev) => {
      const updatedImages = [...prev.imageUrls];
      updatedImages.splice(index, 1);
      return { ...prev, imageUrls: updatedImages };
    });
  };

  // Upload images
  const handleImageSubmit = async () => {
    if (files.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setUploading(true);
    const formDataImages = new FormData();
    files.forEach((file) => formDataImages.append("files", file));

    try {
      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formDataImages,
      });

      const data = await res.json();
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...data.files], // store uploaded URLs
        }));
        alert("Images uploaded successfully!");
      } else {
        alert("Upload failed!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({ ...formData, type: e.target.id });
    }

    if (["parking", "furnished", "offer"].includes(e.target.id)) {
      setFormData({ ...formData, [e.target.id]: e.target.checked });
    }

    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (+formData.regularPrice < +formData.discountPrice) {
      setError("Discount price must be lower than regular price");
      return;
    }

    try {
      setLoading(true);
      setError(false);

      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        credentials: "include",
        body: JSON.stringify({ ...formData, userRef: currentUser._id }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success === false) {
        setError(data.message || "Something went wrong");
        return;
      }

      if (data?.listing?._id) {
        navigate(`/listing/${data.listing._id}`);
      } else {
        setError("Failed to create listing (ID not returned)");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Update a Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking Spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="5000"
                max="1000000"
                required
                className="p-3 border rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>

            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="100000"
                  className="p-3 border rounded-lg"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col items-center">
                  <p>Discounted price</p>
                  <span className="text-xs">($ / month)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="p-3 border rounded w-full"
          />





        {/* Preview */}
<div className="flex gap-2 mt-2 flex-wrap">
  {/* Existing uploaded images */}
  {formData.imageUrls?.map((url, index) => (
    <div key={index} className="relative">
      <img
        src={`http://localhost:3000${url}`} // fetch from backend
        alt={`existing-${index}`}
        className="w-24 h-24 object-cover rounded border"
      />
      <button
        type="button"
        onClick={() => handleRemoveExistingImage(index)}
        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
      >
        X
      </button>
    </div>
  ))}

  {/* New previews for selected files */}
  {previews.map((url, index) => (
    <div key={index} className="relative">
      <img
        src={url}
        alt={`preview-${index}`}
        className="w-24 h-24 object-cover rounded"
      />
      <button
        type="button"
        onClick={() => handleRemoveFile(index)}
        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
      >
        X
      </button>
    </div>
  ))}
</div>


          {/* Upload Button */}
          <button
            type="button"
            onClick={handleImageSubmit}
            disabled={uploading}
            className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
          >
            {uploading ? "Uploading..." : "Upload Images"}
          </button>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80 mt-4"
          >
            {loading ? "Creating..." : "Update Listing"}
          </button>

          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </main>
  );
}