import React, { useState, useCallback } from 'react';
import { Calendar, Eye, EyeOff } from 'lucide-react';

const weeklyMealPlan = {
  Monday: {
    breakfast: ["Uji (porridge)", "Boiled/Fried egg", "Fruit (banana/mango/orange)"],
    dinner: ["Ugali (cooked)", "Sukuma wiki/spinach", "Fish (tilapia/omena)", "Fruit (pawpaw/pineapple/avocado)"]
  },
  Tuesday: {
    breakfast: ["Tea/Cocoa", "Bread", "Spreads (peanut butter/honey)", "Fruit (pawpaw/pineapple/avocado)"],
    dinner: ["Rice (cooked)", "Beans/Ndengu (cooked)", "Cabbage/cucumber salad", "Fruit (banana/mango/orange)"]
  },
  Wednesday: {
    breakfast: ["Mandazi/Pancake", "Tea/Cocoa", "Fruit (banana/mango/orange)"],
    dinner: ["Ugali (cooked)", "Sukuma wiki/spinach", "Chicken (meat, cooked)", "Fruit (banana/mango/orange)"]
  },
  Thursday: {
    breakfast: ["Sweet potatoes (boiled)", "Tea/Cocoa", "Fruit (banana/mango/orange)"],
    dinner: ["Githeri", "Fruit (pawpaw/pineapple/avocado)", "Fruit (banana/mango/orange)"]
  },
  Friday: {
    breakfast: ["Mandazi/Pancake", "Tea/Cocoa", "Fruit (pawpaw/pineapple/avocado)"],
    dinner: ["Chapati", "Beef/Goat (cooked)", "Cabbage/cucumber salad", "Fruit (pawpaw/pineapple/avocado)"]
  },
  Saturday: {
    breakfast: ["Tea/Cocoa", "Chapati", "Boiled/Fried egg", "Fruit (banana/mango/orange)"],
    dinner: ["Pilau", "Cabbage/cucumber salad", "Fruit (pawpaw/pineapple/avocado)"]
  },
  Sunday: {
    breakfast: ["Bread", "Sausages/Smokies", "Fruit (pawpaw/pineapple/avocado)"],
    dinner: ["Potatoes (boiled/mashed)", "Beef/Goat (cooked)", "Cabbage/cucumber salad", "Fruit (banana/mango/orange)"]
  }
};

const ageGroups = [
  { id: 'infants', name: '6-23 months' },
  { id: 'toddlers', name: '24-59 months' },
  { id: 'children', name: '5-9 years' },
  { id: 'teens', name: '10-19 years' },
  { id: 'adults', name: '20-59 years' }
];

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '', email: '', phone: '', building: '', houseNumber: '', password: '',
    familyComposition: { infants: 0, toddlers: 0, children: 0, teens: 0, adults: 1 }
  });
  
  const [users] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "0712345678",
      building: "Building A",
      houseNumber: "A12",
      password: "user123",
      role: "user",
      familyComposition: { infants: 0, toddlers: 1, children: 1, teens: 0, adults: 2 }
    },
    {
      id: 2,
      name: "Admin User",
      email: "admin@store.com",
      phone: "0711111111",
      building: "Store Location",
      houseNumber: "S1",
      password: "meide2025",
      role: "admin",
      familyComposition: { infants: 0, toddlers: 0, children: 0, teens: 0, adults: 1 }
    }
  ]);

  const doLogin = useCallback(() => {
    const user = users.find(u => u.email === loginData.email && u.password === loginData.password);
    if (user) {
      setCurrentUser(user);
      setCurrentView(user.role === 'admin' ? 'admin' : 'user');
    } else {
      alert('Invalid credentials!');
    }
  }, [users, loginData.email, loginData.password]);

  const doSignup = useCallback(() => {
    if (users.find(u => u.email === signupData.email)) {
      alert('Email already exists!');
      return;
    }

    alert('Account created! Please login.');
    setCurrentView('login');
    setSignupData({
      name: '', email: '', phone: '', building: '', houseNumber: '', password: '',
      familyComposition: { infants: 0, toddlers: 0, children: 0, teens: 0, adults: 1 }
    });
  }, [users, signupData.email]);

  const doLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentView('login');
    setLoginData({ email: '', password: '' });
  }, []);

  const updateFamilyCount = useCallback((groupId, change) => {
    setSignupData(prev => ({
      ...prev,
      familyComposition: {
        ...prev.familyComposition,
        [groupId]: Math.max(0, (prev.familyComposition[groupId] || 0) + change)
      }
    }));
  }, []);

  const quickLogin = useCallback((email, password) => {
    setLoginData({ email, password });
    setCurrentView('login');
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Meide Meal Plan Manager</h1>
            <p className="text-gray-600">Weekly meal planning & ingredient tracking</p>
          </div>

          <div className="flex mb-6">
            <button
              onClick={() => setCurrentView('login')}
              className={`flex-1 py-2 px-4 rounded-l-lg ${currentView === 'login' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            >
              Login
            </button>
            <button
              onClick={() => setCurrentView('signup')}
              className={`flex-1 py-2 px-4 rounded-r-lg ${currentView === 'signup' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            >
              Sign Up
            </button>
          </div>

          {currentView === 'login' ? (
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({...prev, email: e.target.value}))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({...prev, password: e.target.value}))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                onClick={doLogin}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Login
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={signupData.name}
                onChange={(e) => setSignupData(prev => ({...prev, name: e.target.value}))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={signupData.email}
                onChange={(e) => setSignupData(prev => ({...prev, email: e.target.value}))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={signupData.phone}
                onChange={(e) => setSignupData(prev => ({...prev, phone: e.target.value}))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Building"
                  value={signupData.building}
                  onChange={(e) => setSignupData(prev => ({...prev, building: e.target.value}))}
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="House"
                  value={signupData.houseNumber}
                  onChange={(e) => setSignupData(prev => ({...prev, houseNumber: e.target.value}))}
                  className="w-24 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Family Composition</h3>
                {ageGroups.map(group => (
                  <div key={group.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{group.name}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => updateFamilyCount(group.id, -1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {signupData.familyComposition[group.id]}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateFamilyCount(group.id, 1)}
                        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  Total: {Object.values(signupData.familyComposition).reduce((sum, count) => sum + count, 0)} members
                </div>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({...prev, password: e.target.value}))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                onClick={doSignup}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Create Account
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
            <p className="font-semibold mb-2">Quick Login:</p>
            <button 
              onClick={() => quickLogin('john@example.com', 'user123')}
              className="block w-full text-left text-blue-600 hover:text-blue-800 mb-1"
            >
              User: john@example.com / user123
            </button>
            <button 
              onClick={() => quickLogin('admin@store.com', 'meide2025')}
              className="block w-full text-left text-blue-600 hover:text-blue-800"
            >
              Admin: admin@store.com / meide2025
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <Calendar className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4 text-green-600">
            Welcome to Meide Meal Plan Manager!
          </h1>
          <p className="text-gray-600 mb-6">
            Hello {currentUser.name}! Your meal planning app is working perfectly.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Sample Weekly Meal Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(weeklyMealPlan).slice(0, 3).map(([day, meals]) => (
                <div key={day} className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-blue-900 mb-2">{day}</h3>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">Breakfast:</p>
                    <p className="text-gray-600 mb-2">{meals.breakfast[0]}</p>
                    <p className="font-medium text-gray-700">Dinner:</p>
                    <p className="text-gray-600">{meals.dinner[0]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Your Family</h3>
              <p className="text-green-700">
                Total Members: {Object.values(currentUser.familyComposition).reduce((sum, count) => sum + count, 0)}
              </p>
            </div>
            
            <button 
              onClick={doLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;