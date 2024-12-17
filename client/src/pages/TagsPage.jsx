import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { tags } from '@/assets/sampleTags'; 

const TagsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex ml-[330px] flex-col gap-6 p-6 bg-background min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-text">Tags</h1>
        <p className="text-text/80">Browse questions by tags</p>
      </div>

      {/* Search Tags */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text/50 h-5 w-5" />
        <Input
          type="text"
          placeholder="Filter by tag name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-foreground border-accent text-text w-full focus:ring-primary focus:border-primary"
        />
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTags.map(tag => (
          <Card
            key={tag.name}
            className="bg-foreground border-dashed border border-accent text-text hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium bg-background/10 ${tag.color}`}>
                #{tag.name}
              </div>
              <CardTitle className="text-text text-sm">
                {tag.count} questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text/80 text-sm">{tag.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TagsPage;