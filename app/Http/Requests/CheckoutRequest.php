<?php

namespace App\Http\Requests;

use App\Models\Cart;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CheckoutRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:8'],
            'ticket_guests' => ['nullable', 'array'],
            'ticket_guests.*.cart_item_id' => ['required', 'integer'],
            'ticket_guests.*.guests' => ['nullable', 'array'],
            'ticket_guests.*.guests.*.name' => ['required', 'string', 'max:255'],
            'ticket_guests.*.guests.*.email' => ['nullable', 'email', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email is required to complete checkout.',
            'ticket_guests.*.guests.*.name.required' => 'Ticket holder name is required.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $cart = $this->resolveCart();
            if (! $cart) {
                $validator->errors()->add('cart', 'Cart not found.');

                return;
            }

            $cart->load('items');

            $ticketGuests = collect($this->input('ticket_guests', []))
                ->filter(fn ($entry) => is_array($entry) && isset($entry['cart_item_id']))
                ->keyBy('cart_item_id');

            foreach ($cart->items as $item) {
                if (! $item->ticket_id) {
                    continue;
                }

                $entry = $ticketGuests->get($item->id);
                if (! $entry || ! isset($entry['guests']) || ! is_array($entry['guests'])) {
                    $validator->errors()->add('ticket_guests', 'Ticket holder names are required for each ticket.');

                    continue;
                }

                if (count($entry['guests']) !== (int) $item->quantity) {
                    $validator->errors()->add('ticket_guests', 'Ticket holder names are required for each ticket.');
                }
            }
        });
    }

    protected function resolveCart(): ?Cart
    {
        if ($this->user()) {
            return Cart::where('user_id', $this->user()->id)->first();
        }

        $cookieCartId = $this->cookie('cart_id');
        $paramCartId = $this->input('cart_id');
        $cartIdToFind = $cookieCartId ?: $paramCartId;
        if ($cartIdToFind) {
            return Cart::find($cartIdToFind);
        }

        $sid = $this->session()->getId();

        return Cart::where('session_id', $sid)->first();
    }
}
