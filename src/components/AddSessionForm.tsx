
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/contexts/ProjectContext';
import { CalendarIcon, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { TimeSession } from '@/types';

interface AddSessionFormProps {
  projectId: string;
  onClose: () => void;
}

const AddSessionForm: React.FC<AddSessionFormProps> = ({ projectId, onClose }) => {
  const { projects, moveSessionToProject } = useProjects();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00:00');
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState('17:00:00');
  const [note, setNote] = useState('');
  
  const currentProject = projects.find(p => p.id === projectId);
  
  if (!currentProject) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the complete start and end date/time objects
    const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number);
    const [endHours, endMinutes, endSeconds] = endTime.split(':').map(Number);
    
    const completeStartDate = new Date(startDate);
    completeStartDate.setHours(startHours, startMinutes, startSeconds || 0);
    
    const completeEndDate = new Date(endDate);
    completeEndDate.setHours(endHours, endMinutes, endSeconds || 0);
    
    // Validate that end time is after start time
    if (completeEndDate <= completeStartDate) {
      alert('End time must be after start time');
      return;
    }
    
    // Create the session object
    const duration = completeEndDate.getTime() - completeStartDate.getTime();
    
    const newSession: TimeSession = {
      id: Date.now().toString(),
      projectId,
      startTime: completeStartDate,
      endTime: completeEndDate,
      note,
      duration
    };
    
    // Use moveSessionToProject to add the session to the project
    // This is a hack but it works with the existing API
    moveSessionToProject('temp', newSession.id, projectId, newSession);
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-1">
      <div className="text-sm font-medium">Add time entry to {currentProject.name}</div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-8 text-xs"
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {format(startDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Start Time</label>
          <div className="flex items-center border rounded-md px-2 h-8">
            <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border-0 p-0 h-7 text-xs focus-visible:ring-0"
              step="1"
            />
          </div>
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground block mb-1">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-8 text-xs"
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                {format(endDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <label className="text-xs text-muted-foreground block mb-1">End Time</label>
          <div className="flex items-center border rounded-md px-2 h-8">
            <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border-0 p-0 h-7 text-xs focus-visible:ring-0"
              step="1"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="text-xs text-muted-foreground block mb-1">Notes</label>
        <Input
          type="text"
          placeholder="What did you work on?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-1">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="h-7 text-xs"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="h-7 text-xs bg-primary"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Entry
        </Button>
      </div>
    </form>
  );
};

export default AddSessionForm;
