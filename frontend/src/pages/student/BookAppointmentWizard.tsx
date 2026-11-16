import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { serviceService } from '../../services/serviceService';
import { appointmentService } from '../../services/appointmentService';
import { Service, TimeSlot, Appointment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StepProgress } from '../../components/ui/StepProgress';
import {
  Calendar,
  Clock,
  Building,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  Radio,
  FileText,
  AlertCircle,
  Printer,
} from 'lucide-react';

const STEPS = [
  { title: 'Service', description: 'Select Office Service' },
  { title: 'Date', description: 'Choose Working Day' },
  { title: 'Time Slot', description: 'Available Time' },
  { title: 'Confirm', description: 'Review & Submit' },
  { title: 'Done', description: 'Token Confirmed' },
];

export const BookAppointmentWizard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { triggerRefresh } = useAppData();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-10');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('10:30 AM');
  const [notes, setNotes] = useState<string>('Semester marksheet attestation for higher studies application.');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load active services
  useEffect(() => {
    serviceService.getAllServices(false).then((data) => {
      const bookable = data.filter((s) => s.appointmentEnabled);
      setServices(bookable);

      // Check URL query param
      const paramServiceId = searchParams.get('serviceId');
      if (paramServiceId) {
        const matched = bookable.find((s) => s.id === paramServiceId);
        if (matched) {
          setSelectedService(matched);
          setCurrentStep(1); // Advance to date selection
        }
      } else if (bookable.length > 0 && !selectedService) {
        setSelectedService(bookable[0]); // Default to Transcript Verification
      }
    });
  }, [searchParams]);

  // Load available time slots when service or date changes
  useEffect(() => {
    if (selectedService && selectedDate) {
      setLoadingSlots(true);
      appointmentService
        .getAvailableSlots(selectedService.id, selectedDate)
        .then((slots) => {
          setAvailableSlots(slots);
          // Set first available slot if not selected
          const firstAvailable = slots.find((s) => s.available);
          if (firstAvailable && !slots.find((s) => s.time === selectedSlot && s.available)) {
            setSelectedSlot(firstAvailable.time);
          }
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedService, selectedDate]);

  const handleNext = () => {
    if (currentStep === 0 && !selectedService) {
      showToast('Please select an administrative service.', 'warning');
      return;
    }
    if (currentStep === 1 && !selectedDate) {
      showToast('Please pick an appointment date.', 'warning');
      return;
    }
    if (currentStep === 2 && !selectedSlot) {
      showToast('Please choose an available time slot.', 'warning');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmitBooking = async () => {
    if (!selectedService || !user) return;
    setIsSubmitting(true);
    try {
      const apt = await appointmentService.bookAppointment({
        serviceId: selectedService.id,
        slotDate: selectedDate,
        slotTime: selectedSlot,
        notes,
        user,
      });
      setConfirmedAppointment(apt);
      triggerRefresh();
      showToast(
        `Appointment booked successfully! Reference: ${apt.referenceNo}`,
        'success',
        'Booking Confirmed'
      );
      setCurrentStep(4); // Confirmation step
    } catch (err: any) {
      showToast(err.message || 'Failed to book appointment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider font-mono">
          Appointment Scheduling System
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
          Book an Administrative Appointment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Follow the 5-step process to reserve a guaranteed counter time slot and digital token.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <StepProgress
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={(idx) => {
          if (idx < currentStep && currentStep < 4) setCurrentStep(idx);
        }}
      />

      {/* STEP 0: Select Service */}
      {currentStep === 0 && (
        <Card>
          <CardHeader
            title="Step 1: Select Administrative Service"
            subtitle="Choose the department office you need to visit"
          />
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0f243d] bg-brand-50/50 ring-2 ring-[#0f243d]/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#0f243d] text-white rounded">
                          {service.code}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {service.name}
                        </h4>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-brand-800 shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                      <span className="truncate max-w-[180px]">{service.office}</span>
                      <span className="font-semibold text-slate-700">{service.durationMinutes} mins</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
          <CardFooter className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              disabled={!selectedService}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Date Selection
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 1: Select Date */}
      {currentStep === 1 && selectedService && (
        <Card>
          <CardHeader
            title="Step 2: Select Appointment Date"
            subtitle={`Configured operating schedule for ${selectedService.name}`}
          />
          <CardBody className="space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Selected Service:</span>
                <div className="font-bold text-sm text-slate-900">{selectedService.name}</div>
              </div>
              <Badge variant="ACTIVE">Working Days: Mon - Fri</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pick Calendar Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min="2026-09-10"
                  max="2026-09-30"
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none bg-white font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Operating hours: 10:00 AM – 04:00 PM (Lunch break: 1:00 PM – 2:00 PM)
                </p>
              </div>

              {/* Quick Date Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Quick Select Dates
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDate('2026-09-10')}
                    className={`p-2 rounded border text-left text-xs transition-all ${
                      selectedDate === '2026-09-10'
                        ? 'bg-brand-50 border-[#0f243d] font-semibold text-[#0f243d]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>Today (10 Sep)</div>
                    <span className="text-[10px] text-emerald-600 font-mono">Slots Open</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDate('2026-09-11')}
                    className={`p-2 rounded border text-left text-xs transition-all ${
                      selectedDate === '2026-09-11'
                        ? 'bg-brand-50 border-[#0f243d] font-semibold text-[#0f243d]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>Tomorrow (11 Sep)</div>
                    <span className="text-[10px] text-emerald-600 font-mono">Slots Open</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDate('2026-09-14')}
                    className={`p-2 rounded border text-left text-xs transition-all ${
                      selectedDate === '2026-09-14'
                        ? 'bg-brand-50 border-[#0f243d] font-semibold text-[#0f243d]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>Next Mon (14 Sep)</div>
                    <span className="text-[10px] text-emerald-600 font-mono">Slots Open</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedDate('2026-09-15')}
                    className={`p-2 rounded border text-left text-xs transition-all ${
                      selectedDate === '2026-09-15'
                        ? 'bg-brand-50 border-[#0f243d] font-semibold text-[#0f243d]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>Next Tue (15 Sep)</div>
                    <span className="text-[10px] text-emerald-600 font-mono">Slots Open</span>
                  </button>
                </div>
              </div>
            </div>
          </CardBody>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" size="sm" onClick={handleNext} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Choose Time Slot
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: Select Time Slot */}
      {currentStep === 2 && (
        <Card>
          <CardHeader
            title="Step 3: Select Available Time Slot"
            subtitle={`Showing slot capacity for ${selectedDate}`}
            action={
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Booked / Full
                </span>
              </div>
            }
          />
          <CardBody className="space-y-4">
            {loadingSlots ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Checking real-time slot availability...
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'bg-[#0f243d] text-white border-[#0f243d] shadow-sm ring-2 ring-[#0f243d]/20'
                            : slot.available
                            ? 'bg-white text-slate-800 border-slate-200 hover:border-brand-500 hover:bg-brand-50/40'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <div className="font-mono text-xs font-bold">{slot.time}</div>
                        <div
                          className={`text-[10px] mt-1 ${
                            isSelected
                              ? 'text-brand-200'
                              : slot.available
                              ? 'text-emerald-700 font-medium'
                              : 'text-slate-400'
                          }`}
                        >
                          {slot.available ? 'Available' : 'Booked'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardBody>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              disabled={!selectedSlot}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Review Booking
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: Confirm Details & Notes */}
      {currentStep === 3 && selectedService && (
        <Card>
          <CardHeader
            title="Step 4: Confirm Booking Details"
            subtitle="Verify information prior to token allocation"
          />
          <CardBody className="space-y-4">
            {/* Booking Summary Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                    Service Details
                  </span>
                  <div className="font-bold text-sm text-slate-900 mt-1">{selectedService.name}</div>
                  <div className="text-slate-600 mt-0.5">{selectedService.office}</div>
                </div>

                <div>
                  <span className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                    Student Details
                  </span>
                  <div className="font-bold text-sm text-slate-900 mt-1">{user?.name}</div>
                  <div className="text-slate-600 font-mono mt-0.5">Roll: {user?.rollNumber || '2023CS042'}</div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <span className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                    Scheduled Date & Time
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-700" />
                    <span>{selectedDate}</span>
                    <span>•</span>
                    <Clock className="w-4 h-4 text-brand-700" />
                    <span>{selectedSlot}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <span className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                    Assigned Counter
                  </span>
                  <div className="font-bold text-slate-900 text-sm mt-1">
                    Counter 2 (Academic Affairs Ground Floor)
                  </div>
                </div>
              </div>
            </div>

            {/* Notes input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Purpose / Specific Verification Request Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Mention any specific marksheet semesters or urgent clearance notes..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#0f243d] outline-none"
              />
            </div>

            {/* Checklist notice */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
              <div>
                <strong className="font-semibold">Document Reminder:</strong> Please remember to bring original documents and college ID card when visiting the counter.
              </div>
            </div>
          </CardBody>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleSubmitBooking}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm & Generate Token
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 4: Appointment Confirmed Screen */}
      {currentStep === 4 && confirmedAppointment && (
        <Card className="border-emerald-300 bg-white">
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 font-mono">
                Booking Reference Confirmed
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Appointment Successfully Booked
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Your time slot and digital queue token have been reserved in the enterprise system.
              </p>
            </div>

            {/* Crisp Institutional Confirmation Slip */}
            <div className="max-w-md mx-auto p-5 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 block">Assigned Digital Token</span>
                  <div className="text-3xl font-mono font-bold text-[#0f243d]">
                    {confirmedAppointment.tokenNo || 'TV-024'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Service Counter</span>
                  <div className="text-lg font-bold text-slate-800">
                    Counter {confirmedAppointment.counterNumber || 2}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Service</span>
                  <strong className="text-slate-900 font-semibold">{confirmedAppointment.serviceName}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Reference ID</span>
                  <strong className="text-slate-900 font-mono font-semibold">{confirmedAppointment.referenceNo}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Scheduled Date</span>
                  <strong className="text-slate-900 font-semibold">{confirmedAppointment.slotDate}</strong>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">Time Slot</span>
                  <strong className="text-slate-900 font-semibold">{confirmedAppointment.slotTime}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{confirmedAppointment.office}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Slip
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/student/appointments')}
                leftIcon={<CalendarCheck className="w-4 h-4" />}
              >
                My Appointments
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/student/queue')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Track In Live Queue
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
