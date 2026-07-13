import { registerAPI } from '@/api/api';
import type { RegisterData } from '@/types/auth';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);


  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  };

  const mutation = useMutation({

    mutationFn: async (data: RegisterData) => {
      return registerAPI(data);
    },
    onSuccess: () => {
      toast.success('Registration successful! Please login.');
      navigate('/login');
    },
    onError: (err: any) => {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        const formatted: Record<string, string> = {};
        Object.entries(serverErrors).forEach(([key, messages]) => {
          formatted[key] = (messages as string[])[0];
        });
        setErrors(formatted);
      }

      const msg =
        err?.response?.data?.message ?? 'Failed to register. Please try again.';
      toast.error(msg);
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!lastName.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (password !== repeatPassword) {
      newErrors.repeatPassword = 'Passwords do not match';
    }
    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    mutation.mutate({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      password,
    });
  };

  const isSubmitting = mutation.isPending;

  return (
    <section className="_social_registration_wrapper _layout_main_wrapper">
      {/* Background shapes */}
      <div className="_shape_one">
        <img src="/images/shape1.svg" alt="" className="_shape_img" />
        <img src="/images/dark_shape.svg" alt="" className="_dark_shape" />
      </div>
      <div className="_shape_two">
        <img src="/images/shape2.svg" alt="" className="_shape_img" />
        <img
          src="/images/dark_shape1.svg"
          alt=""
          className="_dark_shape _dark_shape_opacity"
        />
      </div>
      <div className="_shape_three">
        <img src="/images/shape3.svg" alt="" className="_shape_img" />
        <img
          src="/images/dark_shape2.svg"
          alt=""
          className="_dark_shape _dark_shape_opacity"
        />
      </div>

      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">
            {/* Left image */}
            <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
              <div className="_social_registration_right">
                <div className="_social_registration_right_image">
                  <img src="/images/registration.png" alt="Image" />
                </div>
                <div className="_social_registration_right_image_dark">
                  <img src="/images/registration1.png" alt="Image" />
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
              <div className="_social_registration_content">
                <div className="_social_registration_right_logo _mar_b28">
                  <img
                    src="/images/logo.svg"
                    alt="Image"
                    className="_right_logo"
                  />
                </div>

                <p className="_social_registration_content_para _mar_b8">
                  Get Started Now
                </p>
                <h4 className="_social_registration_content_title _titl4 _mar_b50">
                  Registration
                </h4>

                <button
                  type="button"
                  className="_social_registration_content_btn _mar_b40"
                >
                  <img
                    src="/images/google.svg"
                    alt="Image"
                    className="_google_img"
                  />
                  <span>Register with google</span>
                </button>

                <div className="_social_registration_content_bottom_txt _mar_b40">
                  <span>Or</span>
                </div>

                <form
                  className="_social_registration_form"
                  onSubmit={handleRegister}
                >
                  <div className="row">
                    {/* First Name */}
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">
                          First Name
                        </label>
                        <input
                          type="text"
                          className={`form-control _social_registration_input ${errors.first_name ? 'is-invalid' : ''}`}
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            clearError('first_name');
                          }}
                          placeholder="First name"
                          disabled={isSubmitting}
                        />
                        {errors.first_name && (
                          <div className="invalid-feedback">
                            {errors.first_name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className={`form-control _social_registration_input ${errors.last_name ? 'is-invalid' : ''}`}
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            clearError('last_name');
                          }}
                          placeholder="Last name"
                          disabled={isSubmitting}
                        />
                        {errors.last_name && (
                          <div className="invalid-feedback">
                            {errors.last_name}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">
                          Email
                        </label>
                        <input
                          type="email"
                          className={`form-control _social_registration_input ${errors.email ? 'is-invalid' : ''}`}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearError('email');
                          }}
                          placeholder="Enter your email"
                          disabled={isSubmitting}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">
                            {errors.email}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Password */}
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">
                          Password
                        </label>
                        <input
                          type="password"
                          className={`form-control _social_registration_input ${errors.password ? 'is-invalid' : ''}`}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearError('password');
                          }}
                          placeholder="Enter your password"
                          disabled={isSubmitting}
                        />
                        {errors.password && (
                          <div className="invalid-feedback">
                            {errors.password}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Repeat Password */}
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_social_registration_form_input _mar_b14">
                        <label className="_social_registration_label _mar_b8">
                          Repeat Password
                        </label>
                        <input
                          type="password"
                          className={`form-control _social_registration_input ${errors.repeatPassword ? 'is-invalid' : ''}`}
                          value={repeatPassword}
                          onChange={(e) => {
                            setRepeatPassword(e.target.value);
                            clearError('repeatPassword');
                          }}
                          placeholder="Repeat your password"
                          disabled={isSubmitting}
                        />
                        {errors.repeatPassword && (
                          <div className="invalid-feedback">
                            {errors.repeatPassword}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="row">
                    <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
                      <div className="form-check _social_registration_form_check">
                        <input
                          className="form-check-input _social_registration_form_check_input"
                          type="checkbox"
                          id="agreeTerms"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            clearError('agreeTerms');
                          }}
                          disabled={isSubmitting}
                        />
                        <label
                          className="form-check-label _social_registration_form_check_label"
                          htmlFor="agreeTerms"
                        >
                          I agree to terms &amp; conditions
                        </label>
                        {errors.agreeTerms && (
                          <div className="text-danger small mt-1">
                            {errors.agreeTerms}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="row">
                    <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                      <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                        <button
                          type="submit"
                          className="_social_registration_form_btn_link _btn1"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              />
                              Registering...
                            </>
                          ) : (
                            'Register now'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Login link */}
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_registration_bottom_txt">
                      <p className="_social_registration_bottom_txt_para">
                        Already have an account? <Link to="/login">Login</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;