
import React from 'react';

const FAQPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Frequently Asked Questions</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">How do I use this app?</h2>
          <p>Our app is designed to be intuitive. Just sign up and start chatting with bots!</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Is my data secure?</h2>
          <p>Yes, we take data security very seriously and implement industry-standard security measures.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
