import { useState, useEffect } from 'react';
import { supabase, isSupabaseActive } from './lib/supabase';
import AuthScreen, { AvatarSVG } from './components/AuthScreen';
import Countdown from './components/Countdown';
import CommunityWall from './components/CommunityWall';
import PackingList from './components/PackingList';
import { defaultPackingList } from './constants/packingList';
import Suggestions from './components/Suggestions';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [databaseProfiles, setDatabaseProfiles] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [checkedStates, setCheckedStates] = useState({});
  const [customItems, setCustomItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const syncData = async (user) => {
    try {
      // 1. Fetch other profiles for Community Wall
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*");
      if (!pError) {
        setDatabaseProfiles(profiles || []);
      }
      
      // 2. Fetch suggestions
      const { data: sugs, error: sError } = await supabase
        .from("suggestions")
        .select("*")
        .order("created_at", { ascending: false });
      if (!sError) {
        setSuggestions(sugs?.map(s => ({ text: s.text, date: new Date(s.created_at).toLocaleDateString("he-IL") })) || []);
      }

      // 3. Fetch packing states
      const { data: pState, error: psError } = await supabase
        .from("packing_states")
        .select("*")
        .eq("user_id", user.id)
        .single();
        
      if (!psError && pState) {
        setCheckedStates(pState.checked_items || {});
        setCustomItems(pState.custom_items || []);
      }
    } catch (err) {
      console.error("Failed to sync data from Supabase:", err);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      if (isSupabaseActive) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Fetch current user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const user = {
            id: session.user.id,
            email: session.user.email,
            name: profile?.full_name || session.user.email,
            role: profile?.role || "שליח/ה",
            avatar: profile?.avatar || "campfire"
          };
          setCurrentUser(user);
          await syncData(user);
        }
      } else {
        // Local storage fallback loading
        const storedUser = localStorage.getItem("ramah_user");
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
        
        const storedChecked = localStorage.getItem("ramah_checked_states");
        if (storedChecked) {
          setCheckedStates(JSON.parse(storedChecked));
        }
        
        const storedCustom = localStorage.getItem("ramah_custom_items");
        if (storedCustom) {
          setCustomItems(JSON.parse(storedCustom));
        }

        const storedSuggestions = localStorage.getItem("ramah_suggestions");
        if (storedSuggestions) {
          setSuggestions(JSON.parse(storedSuggestions));
        }
      }
      setLoading(false);
    };

    initApp();
  }, []);

  const handleAuthSuccess = async (user) => {
    setCurrentUser(user);
    if (isSupabaseActive) {
      await syncData(user);
    } else {
      // Load fallback items
      const storedChecked = localStorage.getItem("ramah_checked_states");
      if (storedChecked) setCheckedStates(JSON.parse(storedChecked));
      
      const storedCustom = localStorage.getItem("ramah_custom_items");
      if (storedCustom) setCustomItems(JSON.parse(storedCustom));

      const storedSuggestions = localStorage.getItem("ramah_suggestions");
      if (storedSuggestions) setSuggestions(JSON.parse(storedSuggestions));
    }
  };

  const logoutUser = async () => {
    if (isSupabaseActive) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem("ramah_user");
    setCurrentUser(null);
    setCheckedStates({});
    setCustomItems([]);
    setDatabaseProfiles([]);
    setSuggestions([]);
  };

  const handleToggleItem = async (itemId) => {
    const newCheckedStates = {
      ...checkedStates,
      [itemId]: !checkedStates[itemId]
    };
    setCheckedStates(newCheckedStates);

    if (isSupabaseActive && currentUser?.id) {
      try {
        await supabase.from("packing_states").upsert({
          user_id: currentUser.id,
          checked_items: newCheckedStates,
          custom_items: customItems,
          updated_at: new Date()
        });
      } catch (err) {
        console.error("Error saving packing item:", err);
      }
    } else {
      localStorage.setItem("ramah_checked_states", JSON.stringify(newCheckedStates));
    }
  };

  const handleAddItem = async (itemText) => {
    const newItem = {
      id: "custom_" + Date.now(),
      text: itemText
    };
    const newCustomItems = [...customItems, newItem];
    setCustomItems(newCustomItems);

    if (isSupabaseActive && currentUser?.id) {
      try {
        await supabase.from("packing_states").upsert({
          user_id: currentUser.id,
          checked_items: checkedStates,
          custom_items: newCustomItems,
          updated_at: new Date()
        });
      } catch (err) {
        console.error("Error adding packing item:", err);
      }
    } else {
      localStorage.setItem("ramah_custom_items", JSON.stringify(newCustomItems));
    }
  };

  const handleSubmitSuggestion = async (text) => {
    const newSuggestion = {
      text: text,
      date: new Date().toLocaleDateString("he-IL")
    };
    const newSuggestions = [...suggestions, newSuggestion];
    setSuggestions(newSuggestions);

    if (isSupabaseActive && currentUser?.id) {
      try {
        await supabase.from("suggestions").insert({
          user_id: currentUser.id,
          user_name: currentUser.name || "שליח/ה",
          text: text
        });
      } catch (err) {
        console.error("Error submitting suggestion:", err);
      }
    } else {
      localStorage.setItem("ramah_suggestions", JSON.stringify(newSuggestions));
    }
  };

  const getProgressPercentage = () => {
    const activeLists = ["clothing", "wearables", "miscellaneous", "niceToHave"];
    let totalItems = customItems.length;
    let checkedCount = 0;
    
    activeLists.forEach(category => {
      const list = defaultPackingList[category] || [];
      totalItems += list.length;
      
      list.forEach(item => {
        if (checkedStates[item.id]) {
          checkedCount++;
        }
      });
    });
    
    customItems.forEach(item => {
      if (checkedStates[item.id]) {
        checkedCount++;
      }
    });
    
    return totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--forest-green)' }}>
        <h2>טוען פורטל קמפ רמה... 🏕️</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Supabase Status Banner (Shown if configuration is missing or inactive) */}
      {!isSupabaseActive && (
        <div id="db-status-banner" style={{ backgroundColor: 'var(--campfire-light)', border: '2px solid var(--campfire-amber)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center', color: 'var(--campfire-amber)', fontWeight: 600 }}>
          ⚠️ האתר עובד במצב מקומי בלבד. כדי לסנכרן בין השליחים, יש להזין את פרטי Supabase בקובץ config.js.
        </div>
      )}

      {!currentUser ? (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      ) : (
        <main>
          {/* Top Navigation & User profile widget */}
          <header className="dashboard-header">
            <div className="user-profile-widget">
              <div id="user-avatar-container">
                <AvatarSVG avatarType={currentUser.avatar} size={60} />
              </div>
              <div className="user-info-text">
                <div className="user-name" id="display-name">{currentUser.name}</div>
                <div className="user-role" id="display-role">{currentUser.role}</div>
              </div>
            </div>
            
            <div>
              <button className="logout-btn" onClick={logoutUser}>התנתק 🚪</button>
            </div>
          </header>

          <Countdown />

          <CommunityWall 
            currentUser={currentUser}
            databaseProfiles={databaseProfiles}
            packingProgress={getProgressPercentage()}
          />

          <PackingList 
            checkedStates={checkedStates}
            customItems={customItems}
            onToggleItem={handleToggleItem}
            onAddItem={handleAddItem}
            progressPercentage={getProgressPercentage()}
          />

          <Suggestions 
            suggestions={suggestions}
            onSubmitSuggestion={handleSubmitSuggestion}
          />
        </main>
      )}
    </div>
  );
}
