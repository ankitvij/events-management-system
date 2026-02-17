<?php

namespace App\Http\Requests;

use App\Models\DiscountCode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDiscountCodeRequest extends FormRequest
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
        /** @var DiscountCode|null $discountCode */
        $discountCode = $this->route('discount_code');

        return [
            'code' => ['required', 'string', 'max:80', Rule::unique('discount_codes', 'code')->ignore($discountCode?->id)],
            'promoter_user_id' => ['nullable', 'integer', 'exists:users,id'],
            'active' => ['nullable', 'boolean'],
            'discounts' => ['required', 'array', 'min:1'],
            'discounts.*.event_id' => ['required', 'integer', 'exists:events,id'],
            'discounts.*.ticket_id' => ['required', 'integer', 'exists:tickets,id'],
            'discounts.*.discount_type' => ['required', 'string', 'in:euro,percentage'],
            'discounts.*.discount_value' => ['required', 'numeric', 'gt:0'],
        ];
    }
}
