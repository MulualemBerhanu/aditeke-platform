import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-180px)] w-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50 py-12 px-4">
      <div className="text-center mb-6">
        <h1 className="text-6xl font-bold text-blue-600 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
      </div>
      
      <Card className="w-full max-w-lg border-blue-200 shadow-lg">
        <CardContent className="pt-8 pb-4">
          <div className="flex mb-6 gap-3 items-center">
            <AlertCircle className="h-8 w-8 text-blue-500" />
            <h3 className="text-xl font-medium text-gray-800">
              We couldn't find the page you're looking for
            </h3>
          </div>

          <p className="text-gray-600 mb-4">
            The page you requested doesn't exist or may have been moved. 
            Please check the URL or navigate back to our homepage.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
            <p className="text-sm text-blue-800">
              Need assistance? Contact our support team at <span className="font-medium">support@aditeke.com</span> or call us at <span className="font-medium">(555) 123-4567</span>.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-4 pt-2 pb-6">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home size={18} /> Homepage
            </Link>
          </Button>
          <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Link href="/contact" className="flex items-center justify-center gap-2">
              <ArrowLeft size={18} /> Go Back
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
