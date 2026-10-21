import { ListingHead } from '@/components/listing'
import { Highlight } from '@/components/ui/highlight'
import { ChecksPanel } from '@/demo/checks-panel'
import { LateBookingTest, LateCancelTest, MaxThreeTest } from '@/demo/fest-tests'
import { CancelFreesTest, DoubleClickTest, FriendCancelTest } from '@/demo/more-tests'
import { RushPanel } from '@/demo/rush-panel'

export function LiveCheckPage() {
  return (
    <>
      <ListingHead title="Does booking really work?">
        Booking a seat looks fine when one person tries it. Here we test it the way <Highlight>a real fest</Highlight> would.
      </ListingHead>
      <div className="mt-8 flex flex-col gap-8">
        <RushPanel />
        <DoubleClickTest />
        <CancelFreesTest />
        <FriendCancelTest />
        <div className="mt-8 space-y-2">
          <h2 className="text-2xl font-medium sm:text-[30px]">The organisers' rules</h2>
          <p className="max-w-3xl text-gray-600 sm:text-lg dark:text-gray-300">
            The fest has three rules of its own. They are decisions, not code, so <Highlight>nobody can guess them</Highlight> from "let users book a seat".
          </p>
        </div>
        <LateBookingTest />
        <MaxThreeTest />
        <LateCancelTest />
        <ChecksPanel />
      </div>
    </>
  )
}
