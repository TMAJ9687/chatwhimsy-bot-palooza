
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import { Shield, User, Globe, Calendar } from 'lucide-react';
import { BanRecord } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const ModerationTab: React.FC = () => {
  const { bannedUsers, loadBannedUsers, unbanUser } = useAdmin();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadBannedUsers();
      setLoading(false);
    };
    
    fetchData();
  }, [loadBannedUsers]);
  
  const handleUnban = async (banId: string, identifier: string) => {
    const success = await unbanUser(banId);
    if (success) {
      toast({
        title: 'User Unbanned',
        description: `${identifier} has been unbanned`
      });
    }
  };
  
  const getBanTypeIcon = (type: 'user' | 'ip') => {
    return type === 'user' ? <User className="h-4 w-4" /> : <Globe className="h-4 w-4" />;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation Tools</CardTitle>
        <CardDescription>
          Review and manage banned users, IP addresses, and moderation actions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Banned Users & IPs
              </h3>
              <Button size="sm" variant="outline" onClick={() => loadBannedUsers()} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
            
            {bannedUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Banned On</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bannedUsers.map((ban: BanRecord) => (
                    <TableRow key={ban.id}>
                      <TableCell>
                        <div className="flex items-center">
                          {getBanTypeIcon(ban.identifierType)}
                          <span className="ml-2">
                            {ban.identifierType === 'user' ? 'User' : 'IP Address'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{ban.identifier}</TableCell>
                      <TableCell>{ban.reason}</TableCell>
                      <TableCell>
                        <Badge variant={ban.duration === 'Permanent' ? 'destructive' : 'outline'}>
                          {ban.duration}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {ban.timestamp.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ban.expiresAt ? (
                          <span>
                            {formatDistanceToNow(ban.expiresAt, { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-destructive">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnban(ban.id, ban.identifier)}
                        >
                          Unban
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="border rounded-md p-8 flex items-center justify-center">
                <p className="text-muted-foreground">
                  {loading ? 'Loading banned users...' : 'No banned users or IPs'}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModerationTab;
