
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ReportsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Review and resolve user-submitted reports and feedback.</p>
        <div className="border rounded-md p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Reports dashboard will appear here</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsTab;
