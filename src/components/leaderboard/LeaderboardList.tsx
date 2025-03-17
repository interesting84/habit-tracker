"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Trophy, UserPlus, UserMinus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTierForLevel, TIER_COLORS } from "@/lib/tiers";
import { cn } from "@/lib/utils";
import type { Tier } from "@/lib/tiers";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
}

interface LeaderboardListProps {
  users: User[];
  currentUserId: string;
}

export function LeaderboardList({ users, currentUserId }: LeaderboardListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFollowingInProgress, setIsFollowingInProgress] = useState<{[key: string]: boolean}>({});

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Failed to search users");
      
      const data = await response.json();
      setSearchResults(data.users.filter((u: User) => u.id !== currentUserId));
    } catch (error) {
      toast.error("Failed to search users");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleFollowAction(userId: string, isFollowing: boolean) {
    setIsFollowingInProgress(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await fetch(`/api/users/${userId}/${isFollowing ? 'unfollow' : 'follow'}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
      
      toast.success(`Successfully ${isFollowing ? 'unfollowed' : 'followed'} user`);
      router.refresh();
    } catch (error) {
      toast.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
      console.error(error);
    } finally {
      setIsFollowingInProgress(prev => ({ ...prev, [userId]: false }));
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isSearching}>
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Search Results</h2>
          <div className="space-y-2">
            {searchResults.map((user) => {
              const tier = getTierForLevel(user.level);
              
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.image ?? undefined} />
                      <AvatarFallback>{user.name?.[0] ?? user.email?.[0] ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className={cn("font-medium", TIER_COLORS[tier].text)}>
                        {user.name || user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">Level {user.level}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFollowAction(user.id, false)}
                    disabled={isFollowingInProgress[user.id]}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Follow
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Rankings</h2>
        <div className="space-y-2">
          {users.map((user, index) => {
            const tier = getTierForLevel(user.level);
            
            return (
              <div
                key={user.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border",
                  user.isCurrentUser && "bg-blue-50/50 dark:bg-blue-950/20"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8">
                    {index === 0 ? (
                      <Trophy className="h-6 w-6 text-yellow-500" />
                    ) : (
                      <span className="text-lg font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <Avatar>
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback>{user.name?.[0] ?? user.email?.[0] ?? '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={cn("font-medium", TIER_COLORS[tier].text)}>
                        {user.name || user.email}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Level {user.level} • {user.xp.toLocaleString()} XP
                    </p>
                  </div>
                </div>
                {!user.isCurrentUser && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFollowAction(user.id, true)}
                    disabled={isFollowingInProgress[user.id]}
                  >
                    <UserMinus className="h-4 w-4 mr-1" />
                    Unfollow
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 