import { useCallback, useState } from 'react';

import { CalendarStep } from './CalendarStep';
import { ConfirmStep } from './ConfirmStep';

export function ScheduleForm() {
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);

  // FUNCTION
  const handleClearSelectedDateTime = useCallback(() => {
    setSelectedDateTime(null);
  }, []);
  // END FUNCTION

  if (selectedDateTime) {
    return (
      <ConfirmStep
        schedulingDate={selectedDateTime}
        onCancelConfirmation={handleClearSelectedDateTime}
      />
    );
  }

  return <CalendarStep onSelectDateTime={setSelectedDateTime} />;
}
