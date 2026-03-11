import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';
import { userData } from '@/mocks/user-data';

export function ChangeData() {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-yellow-400 text-black rounded-[30px] cursor-pointer border-0"
          >
            Change data
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm bg-[#2c2c2c] border-0 [&_svg]:text-white [&_button]:cursor-pointer">
          <DialogHeader>
            <DialogTitle className="text-white">Edit profile</DialogTitle>
            <DialogDescription className="text-white">
              Make changes to your profile here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-white" htmlFor="name-1">
                Name
              </Label>
              <Input
                className="bg-white"
                id="name-1"
                name="name"
                defaultValue={userData.userName}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-white" htmlFor="password-1">
                Password
              </Label>
              <Input
                className="bg-white"
                id="password-1"
                name="password"
                type="password"
                defaultValue="********"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-white" htmlFor="email-1">
                Email
              </Label>
              <Input
                className="bg-white"
                id="email-1"
                name="email"
                defaultValue={userData.email}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                className="rounded-[30px] bg-yellow-400 hover:bg-white border-0 cursor-pointer"
                variant="outline"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="bg-yellow-400 hover:bg-white cursor-pointer text-black rounded-[30px]"
              type="submit"
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
