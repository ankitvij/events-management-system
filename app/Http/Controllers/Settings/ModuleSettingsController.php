<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ModuleSettingsUpdateRequest;
use App\Models\ModuleSetting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ModuleSettingsController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('settings/modules', [
            'module_settings' => ModuleSetting::modules(),
        ]);
    }

    public function update(ModuleSettingsUpdateRequest $request): RedirectResponse
    {
        $settings = ModuleSetting::query()->firstOrCreate();
        $settings->fill($request->validated());
        $settings->save();

        return redirect()->route('settings.modules.edit')->with('success', 'Module settings updated.');
    }
}
