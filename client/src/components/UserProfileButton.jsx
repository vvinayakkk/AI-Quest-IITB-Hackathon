import { Award } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';

export const UserProfileButton = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar>
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-gray-800 border border-gray-700">
        <div className="p-2">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-200">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Reputation</span>
              <span className="text-gray-200">{user.reputation}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-400">Badges</span>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">{user.badgesCount?.gold || 0}</span>
                <span className="text-gray-400">{user.badgesCount?.silver || 0}</span>
                <span className="text-amber-600">{user.badgesCount?.bronze || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuItem className="text-text" asChild>
          <div className="text-text" onClick={() => navigate('/profile')}>My Account</div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-red-500">
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};