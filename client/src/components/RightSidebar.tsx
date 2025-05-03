import { COMMUNITY_GUIDELINES, TRENDING_TOPICS, TOP_TECH_IDEAS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, LightbulbIcon } from 'lucide-react';

export function RightSidebar() {
  return (
    <aside className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0 pt-6 lg:pl-6 lg:h-screen-minus-header lg:sticky lg:top-16">
      {/* Community Guidelines Box */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Community Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {COMMUNITY_GUIDELINES.map((guideline, index) => (
              <li key={index} className="flex items-start">
                <Check className="h-4 w-4 text-primary mt-1 mr-2 flex-shrink-0" />
                <span>{guideline}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      {/* Tech Ideas Showcase */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Top Tech Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TOP_TECH_IDEAS.map((idea, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="px-2 py-1 bg-amber-500 bg-opacity-20 rounded-md text-amber-400 text-xs font-medium flex-shrink-0 mt-1">
                  <LightbulbIcon className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-medium">{idea.title}</p>
                  <p className="text-xs text-muted-foreground">{idea.upvotes} upvotes • {idea.days} days ago</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Trending Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {TRENDING_TOPICS.map((topic, index) => (
              <a 
                key={index} 
                href="#" 
                className="block text-sm text-foreground hover:text-primary"
              >
                {topic}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
