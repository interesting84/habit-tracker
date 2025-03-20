"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTierForLevel, TIER_COLORS } from "@/lib/tiers";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
  isFollowing?: boolean;
}

interface LeaderboardListProps {
  users: User[];
  currentUserId: string;
}

export function LeaderboardList({ users, currentUserId }: LeaderboardListProps) {
  const router = useRouter();
  const [isFollowingInProgress, setIsFollowingInProgress] = useState<{[key: string]: boolean}>({});

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
                      <Link
                        href={`/profile/${user.name || user.email}`}
                        className={cn("font-medium hover:underline", TIER_COLORS[tier].text)}
                      >
                        {user.name || user.email}
                      </Link>
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