import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Plus, Trash2, Calendar, MapPin, User, ChevronDown, CheckCircle } from 'lucide-react';
import { COACHES, BASES } from './constants';
import CustomSelect from './components/CustomSelect';
import './index.css';

// Using a placeholder for the logo until provided or imported if it's a local file
const Logo = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-500">
    <path d="M50 0L90 20V50C90 75 70 95 50 100C30 95 10 75 10 50V20L50 0Z" fill="currentColor" opacity="0.2" />
    <path d="M50 5L85 22.5V50C85 71 68.5 89 50 94C31.5 89 15 71 15 50V22.5L50 5Z" fill="currentColor" />
    <path d="M35 45L45 55L65 35" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const formatDisplayDate = (dateString) => {
  if (!dateString) return 'N/A';
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  const d = date.getDate().toString().padStart(2, '0');
  const m = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  return `${d}-${m}-${year}`;
};

function App() {
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      coach: '',
      base: '',
      schedules: [{ dayIn: '', dayOut: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // Transform to Option A structure
    // We map over each schedule and create a flattened row object
    const payload = data.schedules.map(schedule => {
      const selectedCoach = COACHES.find(c => c.ps === data.coach);
      return {
        timestamp: new Date().toISOString(),
        userId: data.coach,
        userName: selectedCoach?.name || '',
        location: data.base,
        scheduleIn: schedule.dayIn,
        scheduleOut: schedule.dayOut
      };
    });

    console.log("=== FORM SUBMITTED PAYLOAD (OPTION A) ===");
    console.log(JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(import.meta.env.VITE_GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.error || 'Failed to submit data');
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSubmittedData(payload);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
      alert("An error occurred while submitting. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-20 flex items-center gap-4">
          <div className="flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">National Guard</h1>
            <p className="text-sm text-gray-500 font-medium">Island Schedule</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Global Information Card */}
          <div className="card space-y-5">
            <div>
              <label className="label-text flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                Coach (PS + Name)
              </label>
              <Controller
                name="coach"
                control={control}
                rules={{ required: "Please select a coach" }}
                render={({ field: { onChange, value } }) => (
                  <CustomSelect
                    options={COACHES.map(coach => ({
                      value: coach.ps,
                      label: `${coach.ps} - ${coach.name}`
                    }))}
                    value={value}
                    onChange={onChange}
                    placeholder="Select your Ps and Name"
                    error={errors.coach}
                  />
                )}
              />
              {errors.coach && <p className="mt-1.5 text-sm text-red-500">{errors.coach.message}</p>}
            </div>

            <div>
              <label className="label-text flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                Base
              </label>
              <Controller
                name="base"
                control={control}
                rules={{ required: "Please select a base" }}
                render={({ field: { onChange, value } }) => (
                  <CustomSelect
                    options={BASES.map(base => ({
                      value: base,
                      label: base
                    }))}
                    value={value}
                    onChange={onChange}
                    placeholder="Select your base"
                    error={errors.base}
                  />
                )}
              />
              {errors.base && <p className="mt-1.5 text-sm text-red-500">{errors.base.message}</p>}
            </div>
          </div>

          <h2 className="text-lg font-bold text-gray-800 pt-2 pb-1">Weekly Schedule</h2>

          {/* Dynamic Schedule Cards */}
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="card relative group animate-in slide-in-from-bottom-2 fade-in duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar size={18} className="text-amber-500" />
                    Entry {index + 1}
                  </h3>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-md hover:bg-red-50"
                      title="Remove entry"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Day In</label>
                    <input
                      type="date"
                      {...register(`schedules.${index}.dayIn`, {
                        required: "Day In is required",
                        validate: {
                          noOverlap: (v, formValues) => {
                            if (!v || !formValues.schedules[index].dayOut) return true;
                            const currentStart = new Date(v);
                            const currentEnd = new Date(formValues.schedules[index].dayOut);
                            if (currentEnd <= currentStart) return true; // Let dayOut validator handle it

                            for (let i = 0; i < formValues.schedules.length; i++) {
                              if (i === index) continue;
                              const other = formValues.schedules[i];
                              if (other.dayIn && other.dayOut) {
                                const otherStart = new Date(other.dayIn);
                                const otherEnd = new Date(other.dayOut);
                                if (otherEnd > otherStart) {
                                  // Overlap condition: Start A < End B AND Start B < End A
                                  // BUT the user says "cant overlap each other". To be safe, any shared date is an overlap
                                  if (currentStart <= otherEnd && otherStart <= currentEnd) {
                                    return "Dates overlap with entry " + (i + 1);
                                  }
                                }
                              }
                            }
                            return true;
                          }
                        }
                      })}
                      className={`input-field ${errors?.schedules?.[index]?.dayIn ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    />
                    {errors?.schedules?.[index]?.dayIn && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.schedules[index].dayIn.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label-text">Day Out</label>
                    <input
                      type="date"
                      {...register(`schedules.${index}.dayOut`, {
                        required: "Day Out is required",
                        validate: {
                          afterDayIn: (v, formValues) => {
                            const dayIn = formValues.schedules[index].dayIn;
                            if (v && dayIn) {
                              if (new Date(v) <= new Date(dayIn)) {
                                return "Day Out must be after Day In";
                              }
                            }
                            return true;
                          },
                          noOverlap: (v, formValues) => {
                            if (!v || !formValues.schedules[index].dayIn) return true;
                            const currentStart = new Date(formValues.schedules[index].dayIn);
                            const currentEnd = new Date(v);
                            if (currentEnd <= currentStart) return true; // handled by afterDayIn

                            for (let i = 0; i < formValues.schedules.length; i++) {
                              if (i === index) continue;
                              const other = formValues.schedules[i];
                              if (other.dayIn && other.dayOut) {
                                const otherStart = new Date(other.dayIn);
                                const otherEnd = new Date(other.dayOut);
                                if (otherEnd > otherStart) {
                                  if (currentStart <= otherEnd && otherStart <= currentEnd) {
                                    return "Dates overlap with entry " + (i + 1);
                                  }
                                }
                              }
                            }
                            return true;
                          }
                        }
                      })}
                      className={`input-field ${errors?.schedules?.[index]?.dayOut ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                    />
                    {errors?.schedules?.[index]?.dayOut && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.schedules[index].dayOut.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({ dayIn: '', dayOut: '' })}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add another schedule
          </button>

          <div className="pt-6 pb-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold shadow-md transition-all flex items-center justify-center gap-2
                ${isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : submitSuccess
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-[#b69a53] hover:bg-[#967d3e] hover:shadow-lg active:scale-[0.98]'
                }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : submitSuccess ? (
                'Submitted Successfully!'
              ) : (
                'Submit Schedules'
              )}
            </button>
          </div>
        </form>

        {/* Submission Preview Card */}
        {submittedData && submittedData.length > 0 && (
          <div className="mb-12 card border-green-200 bg-green-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">Schedules Submitted!</h2>
            </div>

            <div className="bg-white rounded-lg p-5 border border-green-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5"><User size={14} /> Coach</p>
                  <p className="font-medium text-gray-900">{submittedData[0].userName} <span className="text-gray-400 font-normal ml-1">({submittedData[0].userId})</span></p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5"><MapPin size={14} /> Base</p>
                  <p className="font-medium text-gray-900 truncate" title={submittedData[0].location}>{submittedData[0].location}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-3 font-medium">Recorded Dates ({submittedData.length} entries)</p>
                <div className="space-y-2">
                  {submittedData.map((row, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                      <div className="bg-amber-100 text-amber-700 p-1.5 rounded-md">
                        <Calendar size={16} />
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap overflow-hidden">
                        <span className="font-medium text-gray-800 bg-white px-1.5 sm:px-2 py-1 rounded border border-gray-200 shadow-sm pointer-events-none">
                          In: {formatDisplayDate(row.scheduleIn)}
                        </span>
                        {/* <span className="text-gray-400 font-semibold px-0.5 sm:px-1">-</span> */}
                        <span className="font-medium text-gray-800 bg-white px-1.5 sm:px-2 py-1 rounded border border-gray-200 shadow-sm pointer-events-none">
                          Out: {formatDisplayDate(row.scheduleOut)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
