
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ModerationTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Review and manage banned users, reports, and moderation actions.</p>
        <div className="border rounded-md p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Moderation tools will appear here</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModerationTab;
