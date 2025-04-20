
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
          <h1 className="text-3xl font-sen font-bold text-foreground">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We'll start processing your Ghibli art print soon.
          </p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
