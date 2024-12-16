import React, { useState } from 'react';
import * as Tabs from "@radix-ui/react-tabs";
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, HomeIcon, BookmarkIcon, LayersIcon, TagIcon, UserIcon, Bot } from 'lucide-react';

const Sidebar = () => {
  const [selectedTab, setSelectedTab] = useState("Topics");
  const [isCategories, setIsCategories] = useState(false);
  const [isTags, setIsTags] = useState(false);
  const navigate = useNavigate();

  const tabItems = [
    { name: "Topics", icon: HomeIcon },
    { name: "My Posts", icon: UserIcon },
    { name: "Categories", icon: LayersIcon },
    { name: "Tags", icon: TagIcon },
    { name: "Bookmarks", icon: BookmarkIcon },
  ];

  const categories = ["Gaming", "Movies", "Videos", "Coding"];
  const tags = ["Art", "Code", "Question", "General"];

  const handleTabClick = (item) => {
    if (item === "Topics") navigate('/home');
    if (item === "MyPosts") navigate('/myposts');
    if (item === "Categories") setIsCategories(!isCategories);
    if (item === "Tags") setIsTags(!isTags);
  };

  return (
      <div className="fixed left-4 top-[180px] max-h-[800px] w-72 
                    bg-background/95 rounded-xl border border-accent
                    shadow-[0_8px_30px_rgb(0,0,0,0.12)]
                    hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]
                    transition-all duration-300 ease-in-out
                    backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <Tabs.Root
          className="p-4 text-text font-medium"
          value={selectedTab}
          orientation="vertical"
          onValueChange={(val) => setSelectedTab(val)}
        >
          <Tabs.List
            className="flex flex-col items-start gap-y-2 text-text font-medium"
            aria-label="Navigation menu"
          >
            {tabItems.map(({ name, icon: Icon }, idx) => (
              <div key={idx} className="w-full relative group">
                <Tabs.Trigger
                  className="w-full text-left px-4 py-3 rounded-lg
                          transition-all duration-200 ease-in-out
                          text-text/80 hover:text-primary
                          hover:bg-primary/10
                          hover:shadow-[0_2px_10px_-2px_hsl(223,90%,73%/0.2)]
                          data-[state=active]:bg-primary/90 data-[state=active]:text-accent
                          data-[state=active]:shadow-[0_4px_15px_-3px_hsl(223,90%,73%/0.3)]
                          font-medium tracking-wide"
                  value={name}
                  onClick={() => handleTabClick(name)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 transition-transform duration-200 
                                 group-hover:scale-110" />
                    <span>{name}</span>
                    {(name === "Categories" || name === "Tags") && (
                      <ChevronDownIcon
                        className={`ml-auto w-5 h-5 transition-transform duration-200
                                ${name === "Categories" && isCategories ? 'rotate-180' : ''}
                                ${name === "Tags" && isTags ? 'rotate-180' : ''}`}
                      />
                    )}
                  </div>
                </Tabs.Trigger>

                {/* Dropdown Menus */}
                {(name === "Categories" || name === "Tags") && (
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out
                                ${(name === "Categories" && isCategories) || (name === "Tags" && isTags)
                      ? 'max-h-64 opacity-100'
                      : 'max-h-0 opacity-0'}`}>
                    <div className="pt-2 pl-8">
                      {(name === "Categories" ? categories : tags).map((item, idx) => (
                        <button
                          key={idx}
                          className="w-full text-left px-4 py-2.5 rounded-md
                                 text-text/70 hover:text-primary
                                 hover:bg-primary/8
                                 transition-all duration-200
                                 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                          <span>{name === "Tags" ? `#${item}` : item}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Tabs.List>
        </Tabs.Root>

        {/* Genie Bot Avatar */}
        <div className="p-4 border-t border-accent/20" onClick={() => navigate('/genie')}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg 
                         bg-primary/5 hover:bg-primary/10 transition-all duration-200
                         cursor-pointer">
            <Bot className="w-6 h-6 text-primary" />
            <div>
              <div className="text-sm font-medium text-text">Genie Bot</div>
              <div className="text-xs text-text/60">AI Assistant</div>
            </div>
          </div>
        </div>

        {/* Bottom gradient border */}
        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>
  );
};

export default Sidebar;