import { Link } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';

export function NotFoundScreen() {
  return (
    <div className="flex flex-col flex-1">
      <div
        className="
bg-mist-800 
text-yellow-400 
p-5 
m-5 
rounded-2xl 
flex-1
shadow-[inset_0_0_80px_rgba(10,10,10,0.6)]
"
      >
        <h1 className="text-8xl font-semibold">{'< 404 />'}</h1>
        <h2 className="uppercase mt-5 ml-5">houston we have a problem</h2>
        <h2 className="uppercase ml-5">Page Not Found</h2>
        <Link to="/" className="">
          <Button
            className="m-5 mt-10 text-yellow-100 cursor-pointer
            bg-yellow-400 text-gray-950 
            px-5 py-3 shadow-lg 
            transition-all duration-300 ease-in-out
            hover:bg-gray-900 hover:text-yellow-400 
            hover:shadow-[0_0_10px_rgba(250,204,21,0.2)]
            "
          >
            Go home
          </Button>
        </Link>
      </div>
    </div>
  );
}
