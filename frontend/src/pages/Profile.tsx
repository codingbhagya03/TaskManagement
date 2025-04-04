
import React, { useState } from "react";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { toast } from "sonner";

const Profile: React.FC = () => {
  const [user, setUser] = useState({
    name: "Manjay Gupta",
    email: "manjay.gupta@example.com",
    role: "UX/UI Designer",
    bio: "Experienced designer with a passion for creating beautiful and functional user interfaces.",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    avatar: "",
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo profile update
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setUser(formData);
      setIsEditing(false);
      setIsLoading(false);
      toast.success("Profile updated successfully!");
    }, 1500);
  };
  
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center mb-8">
        <button
          onClick={() => window.history.back()}
          className="p-2 mr-4 rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold">Profile</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-800 text-3xl font-medium border-4 border-yellow-500">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-yellow-500 text-black flex items-center justify-center border-2 border-white">
                  <Camera size={18} />
                </button>
              )}
            </div>
            
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-muted-foreground">{user.role}</p>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-6 w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
        
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-xl font-semibold mb-6">
              {isEditing ? "Edit Profile Information" : "Profile Information"}
            </h3>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">
                      Role
                    </label>
                    <input
                      id="role"
                      name="role"
                      type="text"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="text"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Location
                    </label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                    disabled={isLoading}
                  ></textarea>
                </div>
                
                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(user);
                      setIsEditing(false);
                    }}
                    className="px-6 py-2.5 bg-secondary text-foreground font-medium rounded-lg transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h4>
                    <p>{user.name}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                    <p>{user.email}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Role</h4>
                    <p>{user.role}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                    <p>{user.phone}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
                    <p>{user.location}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Bio</h4>
                  <p>{user.bio}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
