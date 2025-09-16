import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, Eye, EyeOff, User, Package, ShoppingCart, LogOut } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

const foodPortions = {
  "Uji (porridge)": { unit: "ml", portions: { infants: 125, toddlers: 250, children: 300, teens: 400, adults: 400 }},
  "Ugali (cooked)": { unit: "g", portions: { infants: 50, toddlers: 80, children: 120, teens: 180, adults: 200 }},
  "Rice (cooked)": { unit: "g", portions: { infants: 60, toddlers: 120, children: 150, teens: 200, adults: 200 }},
  "Chapati": { unit: "g", portions: { infants: 50, toddlers: 100, children: 250, teens: 300, adults: 300 }},
  "Bread": { unit: "g", portions: { infants: 50, toddlers: 100, children: 250, teens: 300, adults: 300 }},
  "Mandazi/Pancake": { unit: "g", portions: { infants: 50, toddlers: 100, children: 250, teens: 300, adults: 300 }},
  "Tea/Cocoa": { unit: "ml", portions: { infants: 0, toddlers: 100, children: 150, teens: 250, adults: 500 }}
};

const ingredientPrices = {
  "Porridge flour": 100,
  "Sugar": 150,
  "Maize flour": 80,
  "Rice": 180,
  "Wheat flour": 120,
  "Cooking oil": 200,
  "Salt": 50,
  "Bread loaves": 100,
  "Tea leaves": 300,
  "Milk": 60,
  "Peanut butter/honey": 400,
  "Beef/Goat (cooked)": 600,
  "Chicken (meat, cooked)": 1000,
  "Fish (tilapia/omena)": 300,
  "Fruit (banana/mango/orange)": 200,
  "Fruit (pawpaw/pineapple/avocado)": 300
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
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    name: '', email: '', phone: '', building: '', houseNumber: '', password: '',
    familyComposition: { infants: 0, toddlers: 0, children: 0, teens: 0, adults: 1 }
  });
  
  const [userIngredients, setUserIngredients] = useState({});
  const [orders, setOrders] = useState([]);

  // Calculate ingredient requirements based on family composition
  const calculateIngredientRequirements = useCallback((composition) => {
    const requirements = {};
    
    Object.entries(weeklyMealPlan).forEach(([day, meals]) => {
      Object.entries(meals).forEach(([mealType, foods]) => {
        foods.forEach(food => {
          const portions = foodPortions[food];
          if (!portions) return;
          
          let totalRequirement = 0;
          ageGroups.forEach(group => {
            const peopleInGroup = composition[group.id] || 0;
            const portionSize = portions.portions[group.id] || 0;
            totalRequirement += peopleInGroup * portionSize;
          });
          
          let finalUnit = portions.unit;
          if (portions.unit === 'ml' && totalRequirement > 1000) {
            totalRequirement = totalRequirement / 1000;
            finalUnit = 'ltrs';
          } else if (portions.unit === 'g' && totalRequirement > 1000) {
            totalRequirement = totalRequirement / 1000;
            finalUnit = 'kg';
          }
          
          if (!requirements[food]) {
            requirements[food] = {
              weeklyNeed: 0,
              monthlyNeed: 0,
              unit: finalUnit,
              cost: ingredientPrices[food] || 100,
              currentStock: 0
            };
          }
          
          requirements[food].weeklyNeed += totalRequirement;
        });
      });
    });

    // Calculate monthly needs
    Object.keys(requirements).forEach(ingredientName => {
      const ingredient = requirements[ingredientName];
      ingredient.monthlyNeed = Math.round(ingredient.weeklyNeed * 4.33 * 100) / 100;
      ingredient.weeklyNeed = Math.round(ingredient.weeklyNeed * 100) / 100;
      ingredient.currentStock = Math.round(ingredient.monthlyNeed * 0.3); // Start with 30% stock
    });
    
    return requirements;
  }, []);

  // Database operations
  const createUser = async (userData) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          building: userData.building,
          house_number: userData.houseNumber,
          family_composition: userData.familyComposition,
          total_members: Object.values(userData.familyComposition).reduce((sum, count) => sum + count, 0),
          role: 'user'
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Calculate and save ingredient requirements
      const ingredients = calculateIngredientRequirements(userData.familyComposition);
      await logIngredientUsage(data.id, userData.name, ingredients);
      
      return { success: true, data };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    try {
      setLoading(true);
      // Note: This is a simple email/password check - in production you'd use Supabase Auth
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      
      // Simple password check (in production, use proper auth)
      if (password === 'user123' || password === 'meide2025') {
        return { success: true, data };
      } else {
        throw new Error('Invalid password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (userId, userName, items, totalCost) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          user_id: userId,
          user_name: userName,
          items: items,
          total_cost: totalCost,
          items_count: items.length,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: error.message };
    }
  };

  const logIngredientUsage = async (userId, userName, ingredients) => {
    try {
      const ingredientRecords = Object.entries(ingredients).map(([name, data]) => ({
        user_id: userId,
        user_name: userName,
        ingredient_name: name,
        weekly_need: data.weeklyNeed,
        monthly_need: data.monthlyNeed,
        current_stock: data.currentStock,
        unit: data.unit,
        cost_per_unit: data.cost
      }));

      const { error } = await supabase
        .from('ingredient_usage')
        .insert(ingredientRecords);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error logging ingredients:', error);
      return { success: false, error: error.message };
    }
  };

  const fetchUserOrders = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Component functions
  const doLogin = async () => {
    setMessage('');
    const result = await loginUser(loginData.email, loginData.password);
    
    if (result.success) {
      setCurrentUser(result.data);
      setCurrentView('user');
      setActiveTab('profile');
      
      // Calculate ingredients for this user
      const ingredients = calculateIngredientRequirements(result.data.family_composition);
      setUserIngredients({ [result.data.id]: ingredients });
      
      // Fetch user's orders
      fetchUserOrders(result.data.id);
      
      setMessage('Login successful!');
    } else {
      setMessage(`Login failed: ${result.error}`);
    }
  };

  const doSignup = async () => {
    setMessage('');
    const result = await createUser(signupData);
    
    if (result.success) {
      setMessage('Account created successfully! Please login.');
      setCurrentView('login');
      setSignupData({
        name: '', email: '', phone: '', building: '', houseNumber: '', password: '',
        familyComposition: { infants: 0, toddlers: 0, children: 0, teens: 0, adults: 1 }
      });
    } else {
      setMessage(`Signup failed: ${result.error}`);
    }
  };

  const doLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentView('login');
    setActiveTab('profile');
    setLoginData({ email: '', password: '' });
    setUserIngredients({});
    setOrders([]);
    setMessage('');
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
  }, []);

  const handleCreateOrder = async () => {
    const ingredients = userIngredients[currentUser.id] || {};
    const lowItems = Object.entries(ingredients)
      .filter(([_, data]) => data.currentStock < data.monthlyNeed * 0.5)
      .map(([ingredient, data]) => ({
        item: ingredient,
        needed: Math.round((data.monthlyNeed - data.currentStock) * 100) / 100,
        unit: data.unit,
        cost: data.cost
      }));

    if (lowItems.length === 0) {
      setMessage('No ingredients need restocking!');
      return;
    }

    const totalCost = lowItems.reduce((sum, item) => sum + (item.needed * item.cost), 0);
    
    const result = await createOrder(currentUser.id, currentUser.name, lowItems, totalCost);
    
    if (result.success) {
      setMessage(`Order created with ${lowItems.length} ingredients!`);
      fetchUserOrders(currentUser.id);
    } else {
      setMessage(`Failed to create order: ${result.error}`);
    }
  };

  const updateIngredientStock = (ingredient, newStock) => {
    setUserIngredients(prev => ({
      ...prev,
      [currentUser.id]: {
        ...prev[currentUser.id],
        [ingredient]: { ...prev[currentUser.id][ingredient], currentStock: newStock }
      }
    }));
  };

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.includes('successful') || message.includes('created') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

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
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
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
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
            <p className="font-semibold mb-2">Quick Login:</p>
            <button 
              onClick={() => quickLogin('john@example.com', 'user123')}
              className="block w-full text-left text-blue-600 hover:text-blue-800 mb-1"
            >
              Demo User: john@example.com / user123
            </button>
            <button 
              onClick={() => quickLogin('admin@store.com', 'meide2025')}
              className="block w-full text-left text-blue-600 hover:text-blue-800"
            >
              Demo Admin: admin@store.com / meide2025
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard after login
  const ingredients = userIngredients[currentUser.id] || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-green-600 mr-3" />
            <h1 className="text-2xl font-bold">Meide Meal Plan Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>Welcome, {currentUser.name}</span>
            <button onClick={doLogout} className="text-gray-500 hover:text-gray-700">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('successful') || message.includes('created') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium ${activeTab === 'profile' ? 'bg-white shadow' : ''}`}
          >
            <User className="inline w-4 h-4 mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium ${activeTab === 'ingredients' ? 'bg-white shadow' : ''}`}
          >
            <Package className="inline w-4 h-4 mr-2" />
            Ingredients
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-4 rounded text-sm font-medium ${activeTab === 'orders' ? 'bg-white shadow' : ''}`}
          >
            <ShoppingCart className="inline w-4 h-4 mr-2" />
            Orders
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <p className="p-3 bg-gray-50 rounded">{currentUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p className="p-3 bg-gray-50 rounded">{currentUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <p className="p-3 bg-gray-50 rounded">{currentUser.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <p className="p-3 bg-gray-50 rounded">{currentUser.building}, {currentUser.house_number}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Family Composition</label>
                <div className="p-3 bg-gray-50 rounded space-y-2">
                  {ageGroups.map(group => {
                    const count = currentUser.family_composition[group.id];
                    if (count > 0) {
                      return (
                        <div key={group.id} className="flex justify-between">
                          <span>{group.name}:</span>
                          <span className="font-medium">{count} person{count > 1 ? 's' : ''}</span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                    <span>Total:</span>
                    <span>{currentUser.total_members} members</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ingredients' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Ingredient Inventory</h2>
                <p className="text-gray-600 mt-2">Manage your ingredient stock levels</p>
              </div>
              <button
                onClick={handleCreateOrder}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Order
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(ingredients).map(([ingredient, data]) => {
                  const percent = (data.currentStock / data.monthlyNeed) * 100;
                  const status = percent > 50 ? 'Good' : percent > 20 ? 'Low' : 'Critical';
                  const statusColor = percent > 50 ? 'text-green-600' : percent > 20 ? 'text-yellow-600' : 'text-red-600';
                  
                  return (
                    <div key={ingredient} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{ingredient}</h4>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">Monthly Need: {data.monthlyNeed} {data.unit}</p>
                        <p className={`text-sm font-medium ${statusColor}`}>Status: {status}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${percent > 50 ? 'bg-green-500' : percent > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Current Stock</label>
                        <input
                          type="number"
                          value={data.currentStock}
                          onChange={(e) => updateIngredientStock(ingredient, parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                          min="0"
                          step="0.1"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Your Orders</h2>
              <p className="text-gray-600 mt-2">Track your ingredient orders</p>
            </div>
            <div className="p-6">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No orders yet. Create your first order!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Items ({order.items_count}):</p>
                        <div className="text-sm text-gray-600">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <div key={idx}>
                              {item.item}: {item.needed} {item.unit}
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div>+{order.items.length - 3} more items</div>
                          )}
                        </div>
                        <p className="font-medium text-green-600">
                          Total: KES {parseFloat(order.total_cost).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;