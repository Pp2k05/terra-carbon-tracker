import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthForm } from '@/components/auth-form'

// ---------------------------------------------------------------------------
// Mock dependencies
// ---------------------------------------------------------------------------

const mockPush = jest.fn()
const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

jest.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: jest.fn(),
    },
    signUp: {
      email: jest.fn(),
    },
  },
}))

// Import after mock so we get the mocked version
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { authClient } = require('@/lib/auth-client')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fillSignInForm = (email = 'test@example.com', password = 'password123') => {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } })
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthForm Component — sign-in mode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "Welcome back" heading for sign-in mode', () => {
    render(<AuthForm mode="sign-in" />)
    expect(screen.getByRole('heading', { level: 1, name: /welcome back/i })).toBeInTheDocument()
  })

  it('does not render the Name field in sign-in mode', () => {
    render(<AuthForm mode="sign-in" />)
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
  })

  it('renders email and password fields', () => {
    render(<AuthForm mode="sign-in" />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders a link to the sign-up page', () => {
    render(<AuthForm mode="sign-in" />)
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/sign-up')
  })

  it('calls signIn.email with correct credentials on submit', async () => {
    authClient.signIn.email.mockResolvedValue({ error: null })
    render(<AuthForm mode="sign-in" />)
    fillSignInForm()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() =>
      expect(authClient.signIn.email).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      }),
    )
  })

  it('redirects to / on successful sign-in', async () => {
    authClient.signIn.email.mockResolvedValue({ error: null })
    render(<AuthForm mode="sign-in" />)
    fillSignInForm()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'))
  })

  it('displays an error message on failed sign-in', async () => {
    authClient.signIn.email.mockResolvedValue({ error: { message: 'Invalid credentials' } })
    render(<AuthForm mode="sign-in" />)
    fillSignInForm()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i),
    )
  })

  it('shows loading state while submitting', async () => {
    // Never resolves so we can check intermediate state
    authClient.signIn.email.mockReturnValue(new Promise(() => {}))
    render(<AuthForm mode="sign-in" />)
    fillSignInForm()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText(/please wait/i)).toBeInTheDocument()
  })

  it('submit button is disabled while loading', async () => {
    authClient.signIn.email.mockReturnValue(new Promise(() => {}))
    render(<AuthForm mode="sign-in" />)
    fillSignInForm()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    const btn = await screen.findByRole('button', { name: /please wait/i })
    expect(btn).toBeDisabled()
  })
})

describe('AuthForm Component — sign-up mode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders "Create an account" heading for sign-up mode', () => {
    render(<AuthForm mode="sign-up" />)
    expect(screen.getByRole('heading', { level: 1, name: /create an account/i })).toBeInTheDocument()
  })

  it('renders Name, Email, and Password fields', () => {
    render(<AuthForm mode="sign-up" />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders a link to the sign-in page', () => {
    render(<AuthForm mode="sign-up" />)
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/sign-in')
  })

  it('calls signUp.email with correct data on submit', async () => {
    authClient.signUp.email.mockResolvedValue({ error: null })
    render(<AuthForm mode="sign-up" />)
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Alice' } })
    fillSignInForm()
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() =>
      expect(authClient.signUp.email).toHaveBeenCalledWith({
        name: 'Alice',
        email: 'test@example.com',
        password: 'password123',
      }),
    )
  })

  it('displays a fallback error message when error.message is undefined', async () => {
    authClient.signUp.email.mockResolvedValue({ error: {} })
    render(<AuthForm mode="sign-up" />)
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Bob' } })
    fillSignInForm()
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i),
    )
  })
})
