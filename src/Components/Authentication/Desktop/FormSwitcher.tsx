import React from "react"
import { LoginForm } from "./LoginForm"
import { SignUpForm } from "./SignUpForm"
import { ResetPasswordForm } from "./ResetPasswordForm"
import {
  FormComponentType,
  InputValues,
  ModalType,
  SubmitHandler,
} from "../Types"

interface Props {
  type: ModalType
  values?: InputValues
  handleSubmit: SubmitHandler
  options?: {
    signupIntent?: string
    redirectTo?: string
  }
}

interface State {
  type?: ModalType
}

export class FormSwitcher extends React.Component<Props, State> {
  static defaultProps: Partial<Props> = {
    values: {},
  }

  constructor(props) {
    super(props)
    this.state = {
      type: this.props.type,
    }
  }

  presentModal = (newType: ModalType) => {
    this.setState({ type: newType })
  }

  render() {
    let Form: FormComponentType
    switch (this.state.type) {
      case ModalType.login:
        Form = LoginForm
        break
      case ModalType.signup:
        Form = SignUpForm
        break
      case ModalType.resetPassword:
        Form = ResetPasswordForm
        break
      default:
        return null
    }

    const { values } = this.props
    const defaultValues = {
      email: values.email || "",
      password: values.password || "",
      name: values.name || "",
      acceptedTermsOfService: values.acceptedTermsOfService || false,
    }

    return (
      <Form
        values={defaultValues}
        handleTypeChange={type => this.presentModal(type)}
        handleSubmit={this.props.handleSubmit}
      />
    )
  }
}