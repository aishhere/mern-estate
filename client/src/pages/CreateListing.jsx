import { useState } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {
  const {currentUser} = useSelector(state => state.user)
  const navigate = useNavigate()
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [formData, setFormData] =useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
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
  console.log(formData);


  // Handle file selection and generate previews
  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 6); // max 6
    setFiles(selectedFiles);

    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  // Remove a single file
  const handleRemoveFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  // Upload images to backend
  const handleImageSubmit = async () => {
    if (files.length === 0) {
      alert("Please select at least one image");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("Images uploaded successfully!");
        console.log("Uploaded URLs:", data.files);
      } else {
        alert("Upload failed!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    if(e.target.id === 'sale' || 
      e.target.id === 'rent'){
      setFormData({
        ...formData,
        type: e.target.id
      })
    }

    if(e.target.id === 'parking' ||  
      e.target.id  === 'furnished' || 
      e.target.id === 'offer'){
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked
      })
    }

    if(e.target.type === 'number' || 
      e.target.type === 'text' || 
      e.target.type === 'textarea'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if(+formData.regularPrice < +formData.discountPrice) return setError('Discount price must be lower than regular price')
      setLoading(true);
      setError(false);
      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data.listing._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
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
            type="text"
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
              checked={formData.type === 'sale'}
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input 
              type="checkbox" 
              id="rent" 
              className="w-5" 
              onChange={handleChange}
              checked={formData.type === 'rent'}
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
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                checked={formData.bedrooms}
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
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                checked={formData.bathrooms}
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
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                checked={formData.regularPrice}
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
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                checked={formData.discountPrice}
              />
              <div className="flex flex-col items-center">
                <p>Discounted price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>

          {/* File input */}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesChange}
            className="p-3 border border-gray-300 rounded w-full"
          />

          {/* Image previews with delete */}
          <div className="flex gap-2 mt-2 flex-wrap">
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

          {/* Upload button */}
          <button
            type="button"
            onClick={handleImageSubmit}
            className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Images"}
          </button>

          <button
            type="submit"
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80 mt-4"
          >
            {loading ? 'Creating...' : 'Create listing'}
          </button>
          {error && <p className="text-red-700 text-sm">{error} </p> }
        </div>
      </form>
    </main>
  );
}
