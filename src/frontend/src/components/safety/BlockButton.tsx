import { Button } from '@/components/ui/button';
import { useBlockUser } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { Ban } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BlockButtonProps {
  userPrincipal: Principal;
  onSuccess?: () => void;
}

export default function BlockButton({ userPrincipal, onSuccess }: BlockButtonProps) {
  const blockUser = useBlockUser();

  const handleBlock = async () => {
    await blockUser.mutateAsync(userPrincipal);
    onSuccess?.();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Ban className="w-4 h-4 mr-2" />
          Block
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block this user?</AlertDialogTitle>
          <AlertDialogDescription>
            This user will no longer be able to see your profile or send you messages. You won't see their profile in discovery either.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBlock} disabled={blockUser.isPending}>
            {blockUser.isPending ? 'Blocking...' : 'Block User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
